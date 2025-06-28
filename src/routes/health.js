const express = require("express");
const { body, validationResult } = require("express-validator");
const axios = require("axios");
const { supabase } = require("../config/database");
const auth = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const healthDataValidation = [
  body("Age")
    .isInt({ min: 10, max: 80 })
    .withMessage("Usia harus antara 10-80 tahun"),
  body("SystolicBP")
    .isInt({ min: 70, max: 200 })
    .withMessage("Tekanan darah sistolik harus antara 70-200 mmHg"),
  body("DiastolicBP")
    .isInt({ min: 40, max: 140 })
    .withMessage("Tekanan darah diastolik harus antara 40-140 mmHg"),
  body("BS")
    .isFloat({ min: 6.0, max: 19.0 })
    .withMessage("Gula darah harus antara 6.0-19.0 mmol/L"),
  body("BodyTemp")
    .isFloat({ min: 98.0, max: 103.0 })
    .withMessage("Suhu tubuh harus antara 98.0-103.0°F"),
  body("HeartRate")
    .isInt({ min: 7, max: 122 })
    .withMessage("Detak jantung harus antara 7-122 bpm"),
];

// @route   POST /api/health/predict
// @desc    Predict maternal health risk
// @access  Private
router.post("/predict", auth, healthDataValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: errors.array(),
      });
    }

    const { Age, SystolicBP, DiastolicBP, BS, BodyTemp, HeartRate } = req.body;

    // Additional validation: diastolic BP should be lower than systolic BP
    if (DiastolicBP >= SystolicBP) {
      return res.status(400).json({
        success: false,
        message: "Tekanan darah diastolik harus lebih rendah dari sistolik",
      });
    }

    // Prepare data for ML API
    const healthData = {
      Age: Number(Age),
      SystolicBP: Number(SystolicBP),
      DiastolicBP: Number(DiastolicBP),
      BS: Number(BS),
      BodyTemp: Number(BodyTemp),
      HeartRate: Number(HeartRate),
    };

    let predictionResult;

    try {
      // Call external ML API
      const mlApiUrl =
        process.env.ML_API_URL ||
        "https://dayattttt2444-maternal-health-risk.hf.space";
      const response = await axios.post(`${mlApiUrl}/predict`, healthData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds timeout
      });

      predictionResult = response.data;
    } catch (mlError) {
      console.error("ML API Error:", mlError.message);

      // Fallback: Simple rule-based prediction if ML API fails
      let riskLevel = "low risk";

      if (
        SystolicBP > 140 ||
        DiastolicBP > 90 ||
        BS > 12.0 ||
        BodyTemp > 100.4 ||
        HeartRate > 100 ||
        Age > 40
      ) {
        riskLevel = "high risk";
      } else if (
        SystolicBP > 130 ||
        DiastolicBP > 80 ||
        BS > 9.0 ||
        BodyTemp > 99.5 ||
        HeartRate > 90 ||
        Age > 35
      ) {
        riskLevel = "mid risk";
      }

      predictionResult = {
        risk_level: riskLevel,
        features: healthData,
        recommendations: getRecommendations(riskLevel),
        fallback: true,
      };
    }

    // Save prediction to database
    const { data: savedPrediction, error } = await supabase
      .from("health_predictions")
      .insert([
        {
          user_id: req.user.id,
          age: Age,
          systolic_bp: SystolicBP,
          diastolic_bp: DiastolicBP,
          blood_sugar: BS,
          body_temp: BodyTemp,
          heart_rate: HeartRate,
          risk_level: predictionResult.risk_level,
          prediction_result: predictionResult,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Save prediction error:", error);
      // Continue even if saving fails
    }

    res.json({
      success: true,
      message: "Prediksi berhasil dilakukan",
      data: predictionResult,
    });
  } catch (error) {
    console.error("Health prediction error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/health/history
// @desc    Get user's health prediction history
// @access  Private
router.get("/history", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const {
      data: predictions,
      error,
      count,
    } = await supabase
      .from("health_predictions")
      .select("*", { count: "exact" })
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Get history error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil riwayat prediksi",
      });
    }

    res.json({
      success: true,
      data: {
        predictions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/health/parameters
// @desc    Get health parameters for frontend
// @access  Public
router.get("/parameters", async (req, res) => {
  try {
    const parameters = {
      age_ranges: [
        { label: "10-20 tahun", value: 15 },
        { label: "21-25 tahun", value: 23 },
        { label: "26-30 tahun", value: 28 },
        { label: "31-35 tahun", value: 33 },
        { label: "36-40 tahun", value: 38 },
        { label: "41-45 tahun", value: 43 },
        { label: "46-50 tahun", value: 48 },
        { label: "> 50 tahun", value: 55 },
      ],
      blood_pressure_ranges: [
        { label: "Normal (< 120/80)", systolic: 110, diastolic: 70 },
        {
          label: "Tinggi Normal (120-139/80-89)",
          systolic: 130,
          diastolic: 85,
        },
        {
          label: "Hipertensi Stage 1 (140-159/90-99)",
          systolic: 150,
          diastolic: 95,
        },
        {
          label: "Hipertensi Stage 2 (≥ 160/100)",
          systolic: 170,
          diastolic: 105,
        },
      ],
      blood_sugar_ranges: [
        { label: "Normal (6.0-7.8)", value: 7.0 },
        { label: "Tinggi (7.9-11.0)", value: 9.5 },
        { label: "Sangat Tinggi (> 11.0)", value: 13.0 },
      ],
      body_temp_ranges: [
        { label: "Normal (98.0-99.5°F)", value: 98.6 },
        { label: "Demam Ringan (99.6-100.4°F)", value: 100.0 },
        { label: "Demam (> 100.4°F)", value: 101.5 },
      ],
      heart_rate_ranges: [
        { label: "Rendah (< 60 bpm)", value: 55 },
        { label: "Normal (60-100 bpm)", value: 80 },
        { label: "Tinggi (> 100 bpm)", value: 110 },
      ],
    };

    res.json({
      success: true,
      data: parameters,
    });
  } catch (error) {
    console.error("Get parameters error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/health/statistics
// @desc    Get user's health statistics
// @access  Private
router.get("/statistics", auth, async (req, res) => {
  try {
    // Get user's prediction statistics
    const { data: stats, error } = await supabase
      .from("health_predictions")
      .select("risk_level")
      .eq("user_id", req.user.id);

    if (error) {
      console.error("Get statistics error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil statistik",
      });
    }

    const statistics = {
      total_predictions: stats.length,
      high_risk_count: stats.filter((s) => s.risk_level === "high risk").length,
      mid_risk_count: stats.filter((s) => s.risk_level === "mid risk").length,
      low_risk_count: stats.filter((s) => s.risk_level === "low risk").length,
    };

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error("Get statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Helper function to get recommendations based on risk level
function getRecommendations(riskLevel) {
  const recommendations = {
    "high risk": {
      tindakan: [
        "Segera konsultasikan kondisi Anda dengan dokter atau bidan",
        "Lakukan pemeriksaan kesehatan secara menyeluruh",
        "Ikuti semua saran dan petunjuk dari tenaga medis",
      ],
      pengawasan: "Perlu pengawasan medis intensif",
      kontrol: "Kontrol mingguan atau sesuai anjuran dokter",
    },
    "mid risk": {
      tindakan: [
        "Lakukan pemeriksaan rutin sesuai jadwal",
        "Jaga pola makan dan istirahat yang baik",
        "Pantau tekanan darah secara teratur",
      ],
      pengawasan: "Perlu pengawasan medis reguler",
      kontrol: "Kontrol 2 minggu sekali atau sesuai anjuran",
    },
    "low risk": {
      tindakan: [
        "Lanjutkan pemeriksaan kehamilan secara rutin",
        "Pertahankan pola hidup sehat",
        "Tetap waspada terhadap perubahan kondisi",
      ],
      pengawasan: "Pengawasan medis rutin",
      kontrol: "Kontrol sesuai jadwal pemeriksaan rutin",
    },
  };

  return recommendations[riskLevel] || recommendations["low risk"];
}

module.exports = router;
