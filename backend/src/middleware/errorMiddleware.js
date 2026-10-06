const errorHandler = (err, req, res, next) => {
  let statusCode =
    err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || "Internal server error";

  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  if (err.name === "SyntaxError") {
    statusCode = 400;
    message = "Invalid JSON payload";
  }

  if (err.name === "PayloadTooLargeError" || err.type === 'entity.too.large') {
    statusCode = 413;
    message = "Payload too large";
  }

  if (err.type === 'cors' || (err.message && err.message.includes('CORS'))) {
    statusCode = 403;
    message = "CORS policy violation";
  }

  if (statusCode >= 500) {
    console.error(err.stack || err.message || err);
    message = "Internal server error";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
