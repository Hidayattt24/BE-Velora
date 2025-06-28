const jwt = require("jsonwebtoken");
const { supabase } = require("../config/database");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token akses tidak ditemukan",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid",
      });
    }

    // Check if user is deleted (soft delete)
    if (user.deleted_at) {
      return res.status(401).json({
        success: false,
        message: "Akun tidak aktif",
      });
    }

    // Set user data with proper userId reference
    req.user = {
      ...user,
      userId: user.id, // Ensure userId is properly set
    };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token telah kedaluwarsa",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = auth;
