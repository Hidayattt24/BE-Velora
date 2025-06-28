const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const { supabase } = require("../config/database");
const auth = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const updateProfileValidation = [
  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nama lengkap harus antara 2-100 karakter"),
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username harus antara 3-50 karakter")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Username hanya boleh mengandung huruf, angka, dan underscore"
    ),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Password lama tidak boleh kosong"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password baru minimal 8 karakter")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password harus mengandung huruf kecil, huruf besar, dan angka"
    ),
];

const changeEmailValidation = [
  body("newEmail")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Format email tidak valid"),
  body("password").notEmpty().withMessage("Password tidak boleh kosong"),
];

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select(
        `
        id, 
        full_name, 
        username, 
        phone, 
        email, 
        profile_picture, 
        created_at, 
        updated_at, 
        last_login
      `
      )
      .eq("id", req.user.userId)
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

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, updateProfileValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: errors.array(),
      });
    }

    const { fullName, username } = req.body;
    const updateData = {};

    if (fullName) updateData.full_name = fullName;
    if (username) {
      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .neq("id", req.user.userId)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username sudah digunakan",
        });
      }
      updateData.username = username;
    }

    updateData.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", req.user.userId)
      .select(
        `
        id, 
        full_name, 
        username, 
        phone, 
        email, 
        profile_picture, 
        updated_at
      `
      )
      .single();

    if (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal memperbarui profil",
      });
    }

    res.json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put(
  "/change-password",
  auth,
  changePasswordValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Data tidak valid",
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Get current user with password
      const { data: user, error } = await supabase
        .from("users")
        .select("id, password_hash")
        .eq("id", req.user.userId)
        .single();

      if (error || !user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password_hash
      );
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Password lama tidak benar",
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const { error: updateError } = await supabase
        .from("users")
        .update({
          password_hash: hashedPassword,
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.user.userId);

      if (updateError) {
        console.error("Change password error:", updateError);
        return res.status(500).json({
          success: false,
          message: "Gagal mengubah password",
        });
      }

      res.json({
        success: true,
        message: "Password berhasil diubah",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   PUT /api/users/change-email
// @desc    Change user email
// @access  Private
router.put("/change-email", auth, changeEmailValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: errors.array(),
      });
    }

    const { newEmail, password } = req.body;

    // Get current user with password
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password_hash")
      .eq("id", req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Password tidak benar",
      });
    }

    // Check if new email is already used
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", newEmail)
      .neq("id", req.user.userId)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    // Update email
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        email: newEmail,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.user.userId)
      .select("id, full_name, username, phone, email, updated_at")
      .single();

    if (updateError) {
      console.error("Change email error:", updateError);
      return res.status(500).json({
        success: false,
        message: "Gagal mengubah email",
      });
    }

    res.json({
      success: true,
      message: "Email berhasil diubah",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Change email error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload profile picture
// @access  Private
const { upload } = require("../middleware/upload");
router.post("/upload-avatar", auth, upload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file yang diupload",
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // Update user profile picture in database
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        profile_picture: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.user.userId)
      .select("id, full_name, username, phone, email, profile_picture")
      .single();

    if (error) {
      console.error("Upload avatar error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengupdate foto profil",
      });
    }

    res.json({
      success: true,
      message: "Foto profil berhasil diupload",
      data: {
        user: updatedUser,
        imageUrl,
      },
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete("/account", auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password diperlukan untuk menghapus akun",
      });
    }

    // Get current user with password
    const { data: user, error } = await supabase
      .from("users")
      .select("id, password_hash")
      .eq("id", req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Password tidak benar",
      });
    }

    // Soft delete user (you might want to implement hard delete or anonymize data)
    const { error: deleteError } = await supabase
      .from("users")
      .update({
        deleted_at: new Date().toISOString(),
        email: `deleted_${Date.now()}@example.com`, // Anonymize email
        phone: null,
      })
      .eq("id", req.user.userId);

    if (deleteError) {
      console.error("Delete account error:", deleteError);
      return res.status(500).json({
        success: false,
        message: "Gagal menghapus akun",
      });
    }

    res.json({
      success: true,
      message: "Akun berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
