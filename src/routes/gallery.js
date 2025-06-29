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

// @route   POST /api/gallery/upload
// @desc    Upload photo to gallery
// @access  Private
router.post(
  "/upload",
  auth,
  require("../middleware/upload-supabase").upload,
  galleryValidation,
  async (req, res) => {
    try {
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

      // Use the public URL from Supabase Storage instead of local path
      const imageUrl = req.file.publicUrl || `/uploads/${req.file.filename}`;

      const { data: photo, error } = await supabase
        .from("gallery_photos")
        .insert([
          {
            user_id: req.user.id,
            image_url: imageUrl,
            title: title || "Foto Kehamilan",
            description,
            pregnancy_week: pregnancy_week ? parseInt(pregnancy_week) : null,
            file_size: req.file.size,
            file_type: req.file.mimetype,
            storage_path: req.file.storagePath || null,
            storage_bucket: req.file.bucket || null,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Upload photo error:", error);
        return res.status(500).json({
          success: false,
          message: "Gagal menyimpan foto",
        });
      }

      res.status(201).json({
        success: true,
        message: "Foto berhasil diupload",
        data: { photo },
      });
    } catch (error) {
      console.error("Upload photo error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   PUT /api/gallery/photos/:id
// @desc    Update photo details
// @access  Private
router.put("/photos/:id", auth, galleryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { title, description, pregnancy_week } = req.body;

    // Check if photo belongs to user
    const { data: existingPhoto, error: checkError } = await supabase
      .from("gallery_photos")
      .select("user_id")
      .eq("id", id)
      .single();

    if (checkError || !existingPhoto) {
      return res.status(404).json({
        success: false,
        message: "Foto tidak ditemukan",
      });
    }

    if (existingPhoto.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk mengedit foto ini",
      });
    }

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (pregnancy_week !== undefined)
      updateData.pregnancy_week = pregnancy_week
        ? parseInt(pregnancy_week)
        : null;

    const { data: photo, error } = await supabase
      .from("gallery_photos")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update photo error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal memperbarui foto",
      });
    }

    res.json({
      success: true,
      message: "Foto berhasil diperbarui",
      data: { photo },
    });
  } catch (error) {
    console.error("Update photo error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   DELETE /api/gallery/photos/:id
// @desc    Delete photo
// @access  Private
router.delete("/photos/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if photo belongs to user and get storage info
    const { data: existingPhoto, error: checkError } = await supabase
      .from("gallery_photos")
      .select("user_id, image_url, storage_path, storage_bucket")
      .eq("id", id)
      .single();

    if (checkError || !existingPhoto) {
      return res.status(404).json({
        success: false,
        message: "Foto tidak ditemukan",
      });
    }

    if (existingPhoto.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk menghapus foto ini",
      });
    }

    // Delete from database first
    const { error } = await supabase
      .from("gallery_photos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete photo error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal menghapus foto",
      });
    }

    // Try to delete from Supabase Storage if storage info exists
    if (existingPhoto.storage_path && existingPhoto.storage_bucket) {
      try {
        const { error: storageError } = await supabase.storage
          .from(existingPhoto.storage_bucket)
          .remove([existingPhoto.storage_path]);

        if (storageError) {
          console.warn("Failed to delete from storage:", storageError);
          // Don't fail the request if storage deletion fails
        }
      } catch (storageDeleteError) {
        console.warn("Storage deletion error:", storageDeleteError);
        // Continue even if storage deletion fails
      }
    }

    // Note: In production, you might want to also delete the physical file
    // from the server or cloud storage

    res.json({
      success: true,
      message: "Foto berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete photo error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/gallery/stats
// @desc    Get gallery statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const { data: photos, error } = await supabase
      .from("gallery_photos")
      .select("pregnancy_week, file_size")
      .eq("user_id", req.user.id);

    if (error) {
      console.error("Get gallery stats error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil statistik galeri",
      });
    }

    const stats = {
      total_photos: photos.length,
      total_size: photos.reduce(
        (sum, photo) => sum + (photo.file_size || 0),
        0
      ),
      photos_by_week: photos.reduce((acc, photo) => {
        if (photo.pregnancy_week) {
          acc[photo.pregnancy_week] = (acc[photo.pregnancy_week] || 0) + 1;
        }
        return acc;
      }, {}),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get gallery stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/gallery/timeline
// @desc    Get photos grouped by pregnancy week
// @access  Private
router.get("/timeline", auth, async (req, res) => {
  try {
    const { data: photos, error } = await supabase
      .from("gallery_photos")
      .select("*")
      .eq("user_id", req.user.id)
      .not("pregnancy_week", "is", null)
      .order("pregnancy_week", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get gallery timeline error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil timeline galeri",
      });
    }

    // Group photos by pregnancy week
    const timeline = photos.reduce((acc, photo) => {
      const week = photo.pregnancy_week;
      if (!acc[week]) {
        acc[week] = [];
      }
      acc[week].push(photo);
      return acc;
    }, {});

    // Convert to array format
    const timelineArray = Object.entries(timeline).map(([week, photos]) => ({
      week: parseInt(week),
      photos,
      count: photos.length,
    }));

    res.json({
      success: true,
      data: { timeline: timelineArray },
    });
  } catch (error) {
    console.error("Get gallery timeline error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
