/**
 * Centralized Error Handling Middleware
 * Ensures consistent JSON error responses across the entire API
 * Hides stack traces and sensitive internal details in production
 */
const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose CastError (e.g. malformed ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with format: ${err.value}`;
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
  }

  // Handle duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered.';
  }

  // Log error internally for debugging
  console.error(`[Error] ${req.method} ${req.originalUrl} - ${statusCode}: ${err.message}`);
  if (!isProduction && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

/**
 * 404 Route Not Found Handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFoundHandler };
