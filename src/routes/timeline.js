const express = require("express");
const { body, validationResult } = require("express-validator");
const { supabase } = require("../config/database");
const auth = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const timelineValidation = [
  body("pregnancy_week")
    .isInt({ min: 1, max: 42 })
    .withMessage("Minggu kehamilan harus antara 1-42"),
  body("health_services")
    .optional()
    .isObject()
    .withMessage("Health services harus berupa object"),
  body("symptoms")
    .optional()
    .isObject()
    .withMessage("Symptoms harus berupa object"),
  body("health_services_notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Catatan layanan kesehatan maksimal 1000 karakter"),
  body("symptoms_notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Catatan gejala maksimal 1000 karakter"),
];

const pregnancyProfileValidation = [
  body("due_date")
    .isISO8601()
    .withMessage("Format tanggal perkiraan lahir tidak valid"),
  body("last_menstrual_period")
    .isISO8601()
    .withMessage("Format tanggal HPHT tidak valid"),
  body("current_weight")
    .optional()
    .isFloat({ min: 30, max: 200 })
    .withMessage("Berat badan harus antara 30-200 kg"),
  body("pre_pregnancy_weight")
    .optional()
    .isFloat({ min: 30, max: 200 })
    .withMessage("Berat badan sebelum hamil harus antara 30-200 kg"),
  body("height")
    .optional()
    .isFloat({ min: 100, max: 250 })
    .withMessage("Tinggi badan harus antara 100-250 cm"),
];

// @route   GET /api/timeline/profile
// @desc    Get user's pregnancy profile
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from("pregnancy_profiles")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Get pregnancy profile error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil profil kehamilan",
      });
    }

    res.json({
      success: true,
      data: { profile: profile || null },
    });
  } catch (error) {
    console.error("Get pregnancy profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/timeline/profile
// @desc    Create or update pregnancy profile
// @access  Private
router.post("/profile", auth, pregnancyProfileValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: errors.array(),
      });
    }

    const {
      due_date,
      last_menstrual_period,
      current_weight,
      pre_pregnancy_weight,
      height,
    } = req.body;

    // Calculate current pregnancy week
    const lmpDate = new Date(last_menstrual_period);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - lmpDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const currentWeek = Math.floor(diffDays / 7);

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("pregnancy_profiles")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    let profile, error;

    if (existingProfile) {
      // Update existing profile
      const result = await supabase
        .from("pregnancy_profiles")
        .update({
          due_date,
          last_menstrual_period,
          current_weight,
          pre_pregnancy_weight,
          height,
          current_week: currentWeek,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", req.user.id)
        .select()
        .single();

      profile = result.data;
      error = result.error;
    } else {
      // Create new profile
      const result = await supabase
        .from("pregnancy_profiles")
        .insert([
          {
            user_id: req.user.id,
            due_date,
            last_menstrual_period,
            current_weight,
            pre_pregnancy_weight,
            height,
            current_week: currentWeek,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      profile = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Save pregnancy profile error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal menyimpan profil kehamilan",
      });
    }

    res.json({
      success: true,
      message: "Profil kehamilan berhasil disimpan",
      data: { profile },
    });
  } catch (error) {
    console.error("Save pregnancy profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/timeline/entries
// @desc    Get timeline entries
// @access  Private
router.get("/entries", auth, async (req, res) => {
  try {
    const { data: entries, error } = await supabase
      .from("timeline_entries")
      .select("*")
      .eq("user_id", req.user.id)
      .order("pregnancy_week", { ascending: false });

    if (error) {
      console.error("Get timeline entries error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data timeline",
      });
    }

    res.json({
      success: true,
      data: { entries },
    });
  } catch (error) {
    console.error("Get timeline entries error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/timeline/entries
// @desc    Create timeline entry
// @access  Private
router.post("/entries", auth, timelineValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: errors.array(),
      });
    }

    const {
      pregnancy_week,
      health_services,
      symptoms,
      health_services_notes,
      symptoms_notes,
    } = req.body;

    // Check if entry for this week already exists
    const { data: existingEntry } = await supabase
      .from("timeline_entries")
      .select("id")
      .eq("user_id", req.user.id)
      .eq("pregnancy_week", pregnancy_week)
      .single();

    let entry, error;

    if (existingEntry) {
      // Update existing entry
      const result = await supabase
        .from("timeline_entries")
        .update({
          health_services: health_services || {},
          symptoms: symptoms || {},
          health_services_notes,
          symptoms_notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingEntry.id)
        .select()
        .single();

      entry = result.data;
      error = result.error;
    } else {
      // Create new entry
      const result = await supabase
        .from("timeline_entries")
        .insert([
          {
            user_id: req.user.id,
            pregnancy_week,
            health_services: health_services || {},
            symptoms: symptoms || {},
            health_services_notes,
            symptoms_notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      entry = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Save timeline entry error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal menyimpan data timeline",
      });
    }

    res.json({
      success: true,
      message: "Data timeline berhasil disimpan",
      data: { entry },
    });
  } catch (error) {
    console.error("Save timeline entry error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/timeline/entries/:week
// @desc    Get timeline entry for specific week
// @access  Private
router.get("/entries/:week", auth, async (req, res) => {
  try {
    const { week } = req.params;
    const pregnancyWeek = parseInt(week);

    if (isNaN(pregnancyWeek) || pregnancyWeek < 1 || pregnancyWeek > 42) {
      return res.status(400).json({
        success: false,
        message: "Minggu kehamilan tidak valid",
      });
    }

    const { data: entry, error } = await supabase
      .from("timeline_entries")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("pregnancy_week", pregnancyWeek)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Get timeline entry error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data timeline",
      });
    }

    res.json({
      success: true,
      data: { entry: entry || null },
    });
  } catch (error) {
    console.error("Get timeline entry error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   DELETE /api/timeline/entries/:week
// @desc    Delete timeline entry for specific week
// @access  Private
router.delete("/entries/:week", auth, async (req, res) => {
  try {
    const { week } = req.params;
    const pregnancyWeek = parseInt(week);

    if (isNaN(pregnancyWeek) || pregnancyWeek < 1 || pregnancyWeek > 42) {
      return res.status(400).json({
        success: false,
        message: "Minggu kehamilan tidak valid",
      });
    }

    const { error } = await supabase
      .from("timeline_entries")
      .delete()
      .eq("user_id", req.user.id)
      .eq("pregnancy_week", pregnancyWeek);

    if (error) {
      console.error("Delete timeline entry error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal menghapus data timeline",
      });
    }

    res.json({
      success: true,
      message: "Data timeline berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete timeline entry error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/timeline/health-services
// @desc    Get available health services data
// @access  Public (no auth required)
router.get("/health-services", async (req, res) => {
  try {
    // Health services data based on Buku KIA 2024 - sesuai dengan frontend
    const healthServices = [
      {
        id: "bloodPressure",
        title: "Pengukuran Tekanan Darah",
        description:
          "Pemeriksaan tekanan darah untuk memantau risiko preeklampsia",
        recommendedWeeks: [
          8, 12, 16, 20, 24, 28, 30, 32, 34, 36, 37, 38, 39, 40,
        ],
      },
      {
        id: "weightCheck",
        title: "Penimbangan Berat Badan",
        description: "Pemantauan pertambahan berat badan selama kehamilan",
        recommendedWeeks: [
          8, 12, 16, 20, 24, 28, 30, 32, 34, 36, 37, 38, 39, 40,
        ],
      },
      {
        id: "fundusHeight",
        title: "Pengukuran Tinggi Fundus Uteri",
        description:
          "Pemeriksaan tinggi rahim untuk memantau pertumbuhan janin",
        recommendedWeeks: [12, 16, 20, 24, 28, 30, 32, 34, 36, 37, 38, 39, 40],
      },
      {
        id: "fetalHeartRate",
        title: "Pemeriksaan Denyut Jantung Janin (DJJ)",
        description:
          "Pemantauan detak jantung janin untuk memastikan kesehatan janin",
        recommendedWeeks: [12, 16, 20, 24, 28, 30, 32, 34, 36, 37, 38, 39, 40],
      },
      {
        id: "fetalPosition",
        title: "Pemeriksaan Presentasi Janin",
        description: "Pemeriksaan posisi janin dalam kandungan",
        recommendedWeeks: [28, 30, 32, 34, 36, 37, 38, 39, 40],
      },
      {
        id: "bloodTest",
        title: "Pemeriksaan Laboratorium (Hb)",
        description: "Tes darah untuk memeriksa kadar hemoglobin",
        recommendedWeeks: [8, 28],
      },
      {
        id: "urineTest",
        title: "Pemeriksaan Urine",
        description: "Tes urine untuk mendeteksi protein dan glukosa",
        recommendedWeeks: [8, 20, 28, 36],
      },
      {
        id: "ttImmunization",
        title: "Imunisasi TT",
        description: "Vaksinasi Tetanus Toxoid sesuai status imunisasi",
        recommendedWeeks: [16, 20],
      },
      {
        id: "ironTablets",
        title: "Pemberian Tablet Tambah Darah",
        description: "Suplemen zat besi untuk mencegah anemia",
        recommendedWeeks: [
          8, 12, 16, 20, 24, 28, 30, 32, 34, 36, 37, 38, 39, 40,
        ],
      },
      {
        id: "counseling",
        title: "Konseling/Nasihat",
        description: "Konsultasi tentang kehamilan, persalinan, dan menyusui",
        recommendedWeeks: [
          8, 12, 16, 20, 24, 28, 30, 32, 34, 36, 37, 38, 39, 40,
        ],
      },
    ];

    res.json({
      success: true,
      data: { healthServices },
    });
  } catch (error) {
    console.error("Get health services error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/timeline/symptoms
// @desc    Get available symptoms data
// @access  Public (no auth required)
router.get("/symptoms", async (req, res) => {
  try {
    // Symptoms data including danger signs based on KIA guidelines - sesuai dengan frontend
    const symptoms = [
      // Danger signs (based on KIA book)
      {
        id: "bleeding",
        title: "Perdarahan",
        description: "Perdarahan pervaginam dalam jumlah sedikit hingga banyak",
        isDanger: true,
      },
      {
        id: "severeHeadache",
        title: "Sakit Kepala Hebat",
        description: "Sakit kepala yang tidak biasa dan sangat mengganggu",
        isDanger: true,
      },
      {
        id: "blurredVision",
        title: "Gangguan Penglihatan",
        description: "Penglihatan kabur atau melihat titik-titik berkedip",
        isDanger: true,
      },
      {
        id: "swelling",
        title: "Bengkak Wajah & Tangan",
        description: "Pembengkakan pada wajah, tangan, atau seluruh tubuh",
        isDanger: true,
      },
      {
        id: "fever",
        title: "Demam Tinggi",
        description: "Suhu tubuh >38°C",
        isDanger: true,
      },
      {
        id: "reducedMovement",
        title: "Gerakan Janin Berkurang",
        description: "Gerakan janin berkurang atau tidak ada",
        isDanger: true,
      },
      {
        id: "waterBreaking",
        title: "Ketuban Pecah",
        description: "Air ketuban keluar dari jalan lahir",
        isDanger: true,
      },
      {
        id: "abdominalPain",
        title: "Nyeri Perut Hebat",
        description: "Nyeri perut yang hebat dan tidak kunjung hilang",
        isDanger: true,
      },
      {
        id: "easyTiring",
        title: "Mudah Lelah",
        description: "Merasa lelah yang berlebihan",
        isDanger: false,
      },
      {
        id: "nausea",
        title: "Mual & Muntah",
        description: "Morning sickness atau mual-muntah ringan",
        isDanger: false,
      },
      {
        id: "fatigue",
        title: "Kelelahan",
        description: "Mudah lelah dan mengantuk",
        isDanger: false,
      },
      {
        id: "heartburn",
        title: "Heartburn",
        description: "Rasa panas/nyeri di dada akibat asam lambung",
        isDanger: false,
      },
      {
        id: "constipation",
        title: "Sembelit",
        description: "Kesulitan buang air besar",
        isDanger: false,
      },
      {
        id: "backPain",
        title: "Nyeri Punggung",
        description: "Nyeri di punggung bagian bawah",
        isDanger: false,
      },
    ];

    res.json({
      success: true,
      data: { symptoms },
    });
  } catch (error) {
    console.error("Get symptoms error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/timeline/summary
// @desc    Get pregnancy tracking summary
// @access  Private
router.get("/summary", auth, async (req, res) => {
  try {
    // Get pregnancy profile
    const { data: profile } = await supabase
      .from("pregnancy_profiles")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    // Get timeline entries
    const { data: entries } = await supabase
      .from("timeline_entries")
      .select("*")
      .eq("user_id", req.user.id);

    // Calculate statistics
    const totalWeeksTracked = entries ? entries.length : 0;
    const dangerSymptomsCount = entries
      ? entries.reduce((count, entry) => {
          const symptoms = entry.symptoms || {};
          const dangerSymptoms = [
            "swelling",
            "bleeding",
            "severePain",
            "headache",
            "visionChanges",
            "reducedMovement",
          ];
          return (
            count + dangerSymptoms.filter((symptom) => symptoms[symptom]).length
          );
        }, 0)
      : 0;

    const summary = {
      profile,
      totalWeeksTracked,
      dangerSymptomsCount,
      lastUpdated:
        entries && entries.length > 0
          ? entries.sort(
              (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
            )[0].updated_at
          : null,
    };

    res.json({
      success: true,
      data: { summary },
    });
  } catch (error) {
    console.error("Get pregnancy summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
