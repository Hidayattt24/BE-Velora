const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const { supabase } = require("../config/database");

// Use memory storage for file upload
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_IMAGE_TYPES?.split(",") || [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Tipe file tidak didukung. Gunakan JPEG, PNG, WebP, atau HEIC."),
      false
    );
  }
};

// Configure multer with size limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1, // Only allow one file at a time
  },
});

// Process image in memory
const processImageBuffer = async (buffer, mimetype) => {
  try {
    let sharpInstance = sharp(buffer);

    // Handle HEIC format
    if (mimetype === "image/heic") {
      // Convert HEIC to JPEG
      sharpInstance = sharpInstance.jpeg({ quality: 85 });
    }

    // Resize if too large
    sharpInstance = sharpInstance.resize(1200, 1200, {
      fit: "inside",
      withoutEnlargement: true,
    });

    // Convert to JPEG for consistent format
    const processedBuffer = await sharpInstance
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toBuffer();

    return processedBuffer;
  } catch (error) {
    console.error("Image processing error:", error);
    return buffer; // Return original if processing fails
  }
};

// Upload file to Supabase Storage
const uploadToSupabaseStorage = async (buffer, filename, mimetype) => {
  try {
    const bucketName = "gallery-photos";
    const filePath = `uploads/${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: mimetype,
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      throw new Error(`Failed to upload to storage: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Failed to get public URL from storage");
    }

    return {
      publicUrl: publicUrlData.publicUrl,
      path: filePath,
      bucket: bucketName,
    };
  } catch (error) {
    console.error("Upload to Supabase Storage failed:", error);
    throw error;
  }
};

// Middleware to handle single file upload with Supabase Storage
const uploadMiddleware = (req, res, next) => {
  const singleUpload = upload.single("image");

  singleUpload(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "Ukuran file terlalu besar. Maksimal 10MB.",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: "Hanya boleh upload 1 file.",
          });
        }
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading file.",
      });
    }

    // If no file uploaded, continue
    if (!req.file) {
      return next();
    }

    try {
      // Process image buffer
      const processedBuffer = await processImageBuffer(
        req.file.buffer,
        req.file.mimetype
      );

      // Generate unique filename
      const uniqueFilename = `${Date.now()}-${uuidv4()}.jpg`;

      // Upload to Supabase Storage
      const uploadResult = await uploadToSupabaseStorage(
        processedBuffer,
        uniqueFilename,
        "image/jpeg"
      );

      // Update file info with Supabase Storage data
      req.file.buffer = processedBuffer;
      req.file.size = processedBuffer.length;
      req.file.filename = uniqueFilename;
      req.file.mimetype = "image/jpeg";
      req.file.publicUrl = uploadResult.publicUrl;
      req.file.storagePath = uploadResult.path;
      req.file.bucket = uploadResult.bucket;

      next();
    } catch (uploadError) {
      console.error("File upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Gagal mengunggah file ke storage. Silakan coba lagi.",
        error: process.env.NODE_ENV === "development" ? uploadError.message : undefined,
      });
    }
  });
};

// Middleware for multiple file uploads
const multipleUploadMiddleware = (req, res, next) => {
  const multipleUpload = upload.array("images", 10); // Max 10 files

  multipleUpload(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "Ukuran file terlalu besar. Maksimal 10MB per file.",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: "Maksimal 10 file dalam sekali upload.",
          });
        }
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading files.",
      });
    }

    // If no files uploaded, continue
    if (!req.files || req.files.length === 0) {
      return next();
    }

    try {
      // Process each uploaded image
      const processedFiles = [];

      for (const file of req.files) {
        const processedBuffer = await processImageBuffer(
          file.buffer,
          file.mimetype
        );
        const uniqueFilename = `${Date.now()}-${uuidv4()}.jpg`;

        // Upload to Supabase Storage
        const uploadResult = await uploadToSupabaseStorage(
          processedBuffer,
          uniqueFilename,
          "image/jpeg"
        );

        processedFiles.push({
          ...file,
          buffer: processedBuffer,
          filename: uniqueFilename,
          size: processedBuffer.length,
          mimetype: "image/jpeg",
          publicUrl: uploadResult.publicUrl,
          storagePath: uploadResult.path,
          bucket: uploadResult.bucket,
        });
      }

      req.files = processedFiles;
      next();
    } catch (uploadError) {
      console.error("Multiple files upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Gagal mengunggah beberapa file ke storage. Silakan coba lagi.",
        error: process.env.NODE_ENV === "development" ? uploadError.message : undefined,
      });
    }
  });
};

// Error handling middleware for upload errors
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "File terlalu besar",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Terlalu banyak file",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Field file tidak diharapkan",
        });
      default:
        return res.status(400).json({
          success: false,
          message: "Error upload file",
        });
    }
  }
  next(err);
};

module.exports = {
  upload: uploadMiddleware,
  multipleUpload: multipleUploadMiddleware,
  uploadErrorHandler,
  processImageBuffer,
  uploadToSupabaseStorage,
};
