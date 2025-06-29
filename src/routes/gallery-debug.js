const express = require("express");
const { body, validationResult } = require("express-validator");
const { supabase } = require("../config/database");
const auth = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const galleryValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Judul foto harus antara 1-100 karakter"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Deskripsi maksimal 500 karakter"),
  body("pregnancy_week")
    .optional()
    .isInt({ min: 1, max: 42 })
    .withMessage("Minggu kehamilan harus antara 1-42"),
];

// @route   GET /api/gallery/photos
// @desc    Get user's photos
// @access  Private
router.get("/photos", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const {
      data: photos,
      error,
      count,
    } = await supabase
      .from("gallery_photos")
      .select("*", { count: "exact" })
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Get photos error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil foto",
      });
    }

    res.json({
      success: true,
      data: {
        photos,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get photos error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/gallery/photos/:id
// @desc    Get single photo
// @access  Private
router.get("/photos/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: photo, error } = await supabase
      .from("gallery_photos")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (error || !photo) {
      return res.status(404).json({
        success: false,
        message: "Foto tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: { photo },
    });
  } catch (error) {
    console.error("Get photo error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Helper function to try different upload middlewares
const getUploadMiddleware = () => {
  try {
    // Try Supabase Storage first
    return require("../middleware/upload-supabase").upload;
  } catch (error) {
    console.warn(
      "Supabase upload middleware not available, falling back to regular upload"
    );
    try {
      // Fallback to Vercel upload
      return require("../middleware/upload-vercel").upload;
    } catch (vercelError) {
      console.warn(
        "Vercel upload middleware not available, falling back to default upload"
      );
      // Fallback to default upload
      return require("../middleware/upload").upload;
    }
  }
};

// @route   POST /api/gallery/upload
// @desc    Upload photo to gallery with fallback support
// @access  Private
router.post(
  "/upload",
  auth,
  (req, res, next) => {
    // Dynamic middleware selection with error handling
    const uploadMiddleware = getUploadMiddleware();
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error("Upload middleware error:", err);
        return res.status(400).json({
          success: false,
          message: err.message || "Error processing upload",
        });
      }
      next();
    });
  },
  galleryValidation,
  async (req, res) => {
    try {
      console.log("Upload request received:", {
        file: req.file
          ? {
              originalname: req.file.originalname,
              mimetype: req.file.mimetype,
              size: req.file.size,
              hasPublicUrl: !!req.file.publicUrl,
              hasFilename: !!req.file.filename,
            }
          : "No file",
        body: req.body,
      });

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Tidak ada file yang diupload",
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Data tidak valid",
          errors: errors.array(),
        });
      }

      const { title, description, pregnancy_week } = req.body;

      // Use the public URL from Supabase Storage, or fallback to local path
      const imageUrl = req.file.publicUrl || `/uploads/${req.file.filename}`;

      console.log("Image URL determined:", imageUrl);

      const insertData = {
        user_id: req.user.id,
        image_url: imageUrl,
        title: title || "Foto Kehamilan",
        description,
        pregnancy_week: pregnancy_week ? parseInt(pregnancy_week) : null,
        file_size: req.file.size,
        file_type: req.file.mimetype,
        created_at: new Date().toISOString(),
      };

      // Add storage metadata if available (Supabase Storage)
      if (req.file.storagePath) {
        insertData.storage_path = req.file.storagePath;
      }
      if (req.file.bucket) {
        insertData.storage_bucket = req.file.bucket;
      }

      console.log("Inserting photo data:", insertData);

      const { data: photo, error } = await supabase
        .from("gallery_photos")
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error("Database insert error:", error);
        return res.status(500).json({
          success: false,
          message: "Gagal menyimpan foto ke database",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        });
      }

      console.log("Photo uploaded successfully:", photo.id);

      res.status(201).json({
        success: true,
        message: "Foto berhasil diupload",
        data: { photo },
      });
    } catch (error) {
      console.error("Upload photo error:", error);
      res.status(500).json({
        success: false,
        message: "Server error saat upload foto",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// ... rest of the routes remain the same
// (PUT, DELETE, GET stats routes)

module.exports = router;
