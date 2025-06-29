const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { supabase, supabaseAdmin } = require("../config/database");

const router = express.Router();

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
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Format email tidak valid"),
  body("password").notEmpty().withMessage("Password tidak boleh kosong"),
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

    // Return user data without password and format field names for frontend
    const { password_hash, full_name, ...rest } = newUser;
    const userData = {
      ...rest,
      fullName: full_name, // Convert full_name to fullName for frontend compatibility
    };

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

    const { email, password } = req.body;

    // Find user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // Update last login
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user data without password and format field names for frontend
    const { password_hash, full_name, ...rest } = user;
    const userData = {
      ...rest,
      fullName: full_name, // Convert full_name to fullName for frontend compatibility
    };

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

    // Format field names for frontend compatibility
    const { full_name, ...rest } = user;
    const userData = {
      ...rest,
      fullName: full_name, // Convert full_name to fullName for frontend compatibility
    };

    res.json({
      success: true,
      data: { user: userData },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/auth/validate
// @desc    Validate JWT token
// @access  Private
router.get("/validate", require("../middleware/auth"), async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, phone, email, created_at, updated_at, last_login")
      .eq("id", req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Format field names for frontend compatibility
    const { full_name, ...rest } = user;
    const userData = {
      ...rest,
      fullName: full_name, // Convert full_name to fullName for frontend compatibility
    };

    res.json({
      success: true,
      data: { user: userData },
    });
  } catch (error) {
    console.error("Validate token error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
