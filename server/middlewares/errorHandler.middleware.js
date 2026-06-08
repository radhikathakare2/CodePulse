const { ApiError } = require('../utils/apiResponse');

/**
 * Global Express error handler middleware.
 * Translates various error types into standardized ApiError responses.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // If not already an ApiError, wrap it
  if (!(error instanceof ApiError)) {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = [];

    // Mongoose: Validation Error
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation failed';
      errors = Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
    }

    // Mongoose: Duplicate Key Error (code 11000)
    else if (err.code === 11000) {
      statusCode = 409;
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      const value = err.keyValue ? err.keyValue[field] : 'value';
      message = `A user with this ${field} (${value}) already exists.`;
    }

    // Mongoose: Cast Error (invalid ObjectId)
    else if (err.name === 'CastError') {
      statusCode = 400;
      message = `Invalid ${err.path}: ${err.value}`;
    }

    // JWT: Errors
    else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token. Please log in again.';
    } else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired. Please log in again.';
    }

    error = new ApiError(statusCode, message, errors, err.stack);
  }

  // Log server errors (not client errors)
  if (error.statusCode >= 500) {
    console.error('❌ Server Error:', {
      message: error.message,
      url: req.originalUrl,
      method: req.method,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = { errorHandler };
