const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware: Verify JWT access token.
 * Accepts token from:
 *   1. Authorization header: "Bearer <token>"
 *   2. Cookie: "accessToken"
 */
const verifyJWT = asyncHandler(async (req, _res, next) => {
  // Extract token
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please log in.');
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired. Please refresh your session.');
    }
    throw new ApiError(401, 'Invalid access token. Please log in again.');
  }

  // Fetch user
  const user = await User.findById(decoded.userId).select('-password -refreshToken');
  if (!user) {
    throw new ApiError(401, 'User associated with this token no longer exists.');
  }

  if (user.isBanned) {
    throw new ApiError(403, 'Your account has been suspended. Contact support.');
  }

  req.user = user;
  next();
});

module.exports = { verifyJWT };
