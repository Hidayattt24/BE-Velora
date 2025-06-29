const express = require("express");
const { body, validationResult } = require("express-validator");
const { supabase } = require("../config/database");
const auth = require("../middleware/auth");

const router = express.Router();

// Validation middleware for health risk prediction
const healthRiskValidation = [
  body("age")
    .isInt({ min: 15, max: 50 })
    .withMessage("Age must be between 15-50"),
  body("systolic_bp")
    .isInt({ min: 70, max: 200 })
    .withMessage("Systolic BP must be between 70-200"),
  body("diastolic_bp")
    .isInt({ min: 40, max: 120 })
    .withMessage("Diastolic BP must be between 40-120"),
  body("blood_sugar")
    .isFloat({ min: 3.0, max: 25.0 })
    .withMessage("Blood sugar must be between 3.0-25.0"),
  body("body_temp")
    .isFloat({ min: 35.0, max: 42.0 })
    .withMessage("Body temperature must be between 35.0-42.0"),
  body("heart_rate")
    .isInt({ min: 50, max: 150 })
    .withMessage("Heart rate must be between 50-150"),
  body("risk_level")
    .isIn(["low risk", "mid risk", "high risk"])
    .withMessage("Risk level must be 'low risk', 'mid risk', or 'high risk'"),
  body("user_data").isObject().withMessage("User data must be an object"),
  body("user_data.nama")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nama must be between 2-100 characters"),
  body("user_data.usia")
    .isString()
    .trim()
    .isLength({ min: 1, max: 3 })
    .withMessage("Usia must be provided as string"),
  body("user_data.golonganDarah")
    .isIn(["A", "B", "AB", "O"])
    .withMessage("Golongan darah must be A, B, AB, or O"),
];

// @route   POST /api/diagnosa/predict
// @desc    Save health risk prediction
// @access  Private
router.post("/predict", auth, healthRiskValidation, async (req, res) => {
  try {
    console.log("=== DIAGNOSA API DEBUG ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: errors.array(),
      });
    }

    const {
      age,
      systolic_bp,
      diastolic_bp,
      blood_sugar,
      body_temp,
      heart_rate,
      risk_level,
      user_data,
      prediction_result,
    } = req.body;

    // Save prediction to database
    const { data: prediction, error } = await supabase
      .from("health_predictions")
      .insert([
        {
          user_id: req.user.userId,
          age,
          systolic_bp,
          diastolic_bp,
          blood_sugar,
          body_temp,
          heart_rate,
          risk_level,
          prediction_result: {
            user_data,
            prediction_result: prediction_result || null,
            timestamp: new Date().toISOString(),
          },
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal menyimpan hasil prediksi",
      });
    }

    res.status(201).json({
      success: true,
      message: "Hasil prediksi berhasil disimpan",
      data: {
        prediction,
      },
    });
  } catch (error) {
    console.error("Save prediction error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/diagnosa/history
// @desc    Get user's health prediction history
// @access  Private
router.get("/history", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get user's prediction history with pagination
    const {
      data: predictions,
      error,
      count,
    } = await supabase
      .from("health_predictions")
      .select("*", { count: "exact" })
      .eq("user_id", req.user.userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil riwayat prediksi",
      });
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        predictions,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get prediction history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/diagnosa/history/:id
// @desc    Get specific prediction by ID
// @access  Private
router.get("/history/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get specific prediction
    const { data: prediction, error } = await supabase
      .from("health_predictions")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.userId)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(404).json({
        success: false,
        message: "Prediksi tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: {
        prediction,
      },
    });
  } catch (error) {
    console.error("Get prediction error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   DELETE /api/diagnosa/history/:id
// @desc    Delete specific prediction by ID
// @access  Private
router.delete("/history/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete specific prediction
    const { error } = await supabase
      .from("health_predictions")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.userId);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal menghapus prediksi",
      });
    }

    res.json({
      success: true,
      message: "Prediksi berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete prediction error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/diagnosa/stats
// @desc    Get user's health statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    // Get user's prediction statistics
    const { data: stats, error } = await supabase
      .from("health_predictions")
      .select("risk_level, created_at")
      .eq("user_id", req.user.userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil statistik",
      });
    }

    // Calculate statistics
    const totalPredictions = stats.length;
    const riskLevelCounts = stats.reduce((acc, prediction) => {
      acc[prediction.risk_level] = (acc[prediction.risk_level] || 0) + 1;
      return acc;
    }, {});

    // Get recent trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPredictions = stats.filter(
      (prediction) => new Date(prediction.created_at) >= thirtyDaysAgo
    );

    const latestPrediction = stats.length > 0 ? stats[0] : null;

    res.json({
      success: true,
      data: {
        total_predictions: totalPredictions,
        risk_level_counts: {
          "low risk": riskLevelCounts["low risk"] || 0,
          "mid risk": riskLevelCounts["mid risk"] || 0,
          "high risk": riskLevelCounts["high risk"] || 0,
        },
        recent_predictions: recentPredictions.length,
        latest_prediction: latestPrediction,
        trends: {
          last_30_days: recentPredictions.length,
          dominant_risk_level:
            Object.keys(riskLevelCounts).reduce((a, b) =>
              riskLevelCounts[a] > riskLevelCounts[b] ? a : b
            ) || "low risk",
        },
      },
    });
  } catch (error) {
    console.error("Get prediction stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
