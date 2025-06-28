const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  let error = { ...err };
  error.message = err.message;

  // Supabase errors
  if (err.code) {
    switch (err.code) {
      case "23505": // Unique violation
        error.message = "Data sudah ada dalam sistem";
        error.statusCode = 400;
        break;
      case "23502": // Not null violation
        error.message = "Data wajib tidak boleh kosong";
        error.statusCode = 400;
        break;
      case "42P01": // Undefined table
        error.message = "Tabel tidak ditemukan";
        error.statusCode = 500;
        break;
      default:
        error.message = "Database error";
        error.statusCode = 500;
    }
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Token tidak valid";
    error.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    error.message = "Token telah kedaluwarsa";
    error.statusCode = 401;
  }

  // Validation errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error.message = message;
    error.statusCode = 400;
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    error.message = "File terlalu besar";
    error.statusCode = 400;
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    error.message = "Field file tidak valid";
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
