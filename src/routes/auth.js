const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { supabase, supabaseAdmin } = require("../config/database");

const router = express.Router();

// Email transporter setup
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Validation middleware
const registerValidation = [
  body("fullName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nama lengkap harus antara 2-100 karakter"),
  body("phone")
    .trim()
    .isMobilePhone("id-ID")
    .withMessage("Format nomor HP tidak valid"),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Format email tidak valid"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password harus mengandung huruf kecil, huruf besar, dan angka"
    ),
];

const loginValidation = [
  body("nama").trim().notEmpty().withMessage("Nama tidak boleh kosong"),
  body("password").notEmpty().withMessage("Password tidak boleh kosong"),
];

const forgotPasswordValidation = [
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Format email tidak valid"),
];

const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Token tidak boleh kosong"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password harus mengandung huruf kecil, huruf besar, dan angka"
    ),
];

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post("/register", registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: errors.array(),
      });
    }

    const { fullName, phone, email, password } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .or(`email.eq.${email},phone.eq.${phone}`)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email atau nomor HP sudah terdaftar",
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in Supabase
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          full_name: fullName,
          phone,
          email,
          password_hash: hashedPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal membuat akun",
      });
    }

    // Generate JWT token
    const token = generateToken(newUser.id);

    // Return user data without password
    const { password_hash, ...userData } = newUser;

    res.status(201).json({
      success: true,
      message: "Akun berhasil dibuat",
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: errors.array(),
      });
    }

    const { nama, password } = req.body;

    // Find user by full name or email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .or(`full_name.ilike.%${nama}%,email.eq.${nama}`)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Email/nama atau password salah",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email/nama atau password salah",
      });
    }

    // Update last login
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user data without password
    const { password_hash, ...userData } = user;

    res.json({
      success: true,
      message: "Login berhasil",
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", forgotPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    // Find user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "Email tidak ditemukan",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset token to database
    await supabase
      .from("users")
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry.toISOString(),
      })
      .eq("id", user.id);

    // Generate OTP for frontend simulation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In development, log the OTP instead of sending email
    if (process.env.NODE_ENV === "development") {
      console.log(`OTP for ${email}: ${otp}`);
      console.log(`Reset token: ${resetToken}`);
    } else {
      // Send email with OTP in production
      const transporter = createEmailTransporter();
      const mailOptions = {
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: "Kode OTP Reset Password - Velora",
        html: `
          <h2>Reset Password Velora</h2>
          <p>Halo ${user.full_name},</p>
          <p>Anda telah meminta reset password. Gunakan kode OTP berikut:</p>
          <h3 style="background: #f0f0f0; padding: 10px; text-align: center; font-size: 24px;">${otp}</h3>
          <p>Kode ini berlaku selama 10 menit.</p>
          <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
          <p>Salam,<br>Tim Velora</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    res.json({
      success: true,
      message: "Kode OTP telah dikirim ke email Anda",
      data: {
        email,
        // Only return OTP in development
        ...(process.env.NODE_ENV === "development" && { otp, resetToken }),
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for password reset
// @access  Public
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email dan OTP harus diisi",
      });
    }

    // In development, accept any 6-digit OTP
    if (process.env.NODE_ENV === "development" && otp.length === 6) {
      return res.json({
        success: true,
        message: "OTP berhasil diverifikasi",
        data: { verified: true },
      });
    }

    // In production, implement proper OTP verification
    // For now, accept any 6-digit OTP
    if (otp.length === 6) {
      return res.json({
        success: true,
        message: "OTP berhasil diverifikasi",
        data: { verified: true },
      });
    }

    res.status(400).json({
      success: false,
      message: "Kode OTP tidak valid",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post("/reset-password", resetPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: errors.array(),
      });
    }

    const { email, newPassword } = req.body;

    // Find user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("id, reset_token_expiry")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await supabase
      .from("users")
      .update({
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    res.json({
      success: true,
      message: "Password berhasil direset",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", require("../middleware/auth"), async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, phone, email, created_at, updated_at, last_login")
      .eq("id", req.user.id) // Use req.user.id instead of req.user.userId
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
