const notFound = (req, res, next) => {
  const error = new Error(`Endpoint tidak ditemukan - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: error.message,
  });
};

module.exports = notFound;
