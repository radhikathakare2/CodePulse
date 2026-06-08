const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateTokenPair, generateRefreshToken, generateAccessToken } = require('../utils/generateTokens');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// Cookie options for refresh token
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
};

/**
 * POST /api/v1/auth/register
 * Register a new user account.
 */
const register = asyncHandler(async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { name, username, email, password } = req.body;

  // Check for existing user
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'username';
    throw new ApiError(409, `An account with this ${field} already exists.`);
  }

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const user = await User.create({
    name,
    username,
    email,
    password,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
  });

  // Send verification email (non-blocking)
  sendVerificationEmail(email, verificationToken, name).catch((err) =>
    console.error('Verification email error:', err.message)
  );

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user._id.toString());

  // Save refresh token to DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set cookies
  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  const userObj = user.toJSON();

  return res.status(201).json(
    new ApiResponse(
      201,
      { user: userObj, accessToken },
      'Account created! Please check your email to verify your account.'
    )
  );
});

/**
 * POST /api/v1/auth/verify-email
 * Verify user's email using the token.
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, 'Verification token is required.');
  }

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification token. Please request a new one.');
  }

  // Mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save({ validateBeforeSave: false });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user.email, user.name).catch((err) =>
    console.error('Welcome email error:', err.message)
  );

  return res.status(200).json(
    new ApiResponse(200, { userId: user._id }, 'Email verified successfully! Welcome to CodePulse.')
  );
});

/**
 * POST /api/v1/auth/login
 * Authenticate user and return tokens.
 */
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (user.isBanned) {
    throw new ApiError(403, 'Your account has been suspended. Contact support.');
  }

  // Compare password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email address before logging in.');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user._id.toString());

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set cookies
  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  const userObj = user.toJSON();

  return res.status(200).json(
    new ApiResponse(200, { user: userObj, accessToken }, 'Login successful!')
  );
});

/**
 * POST /api/v1/auth/logout
 * Clear tokens and log the user out.
 */
const logout = asyncHandler(async (req, res) => {
  // Clear refresh token from DB if user is authenticated
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return res.status(200).json(new ApiResponse(200, {}, 'Logged out successfully.'));
});

/**
 * POST /api/v1/auth/refresh-token
 * Issue a new access token using a valid refresh token.
 */
const refreshToken = asyncHandler(async (req, res) => {
  // Extract refresh token from cookie or body
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is missing. Please log in again.');
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token. Please log in again.');
  }

  const user = await User.findById(decoded.userId);
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token has been revoked. Please log in again.');
  }

  // Generate new token pair (token rotation)
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    generateTokenPair(user._id.toString());

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('accessToken', newAccessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json(
    new ApiResponse(200, { accessToken: newAccessToken }, 'Token refreshed successfully.')
  );
});

/**
 * POST /api/v1/auth/forgot-password
 * Send a password reset email.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { email } = req.body;

  const user = await User.findOne({ email });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        'If an account exists with this email, a password reset link has been sent.'
      )
    );
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  // Send reset email
  sendPasswordResetEmail(user.email, resetToken, user.name).catch((err) =>
    console.error('Reset email error:', err.message)
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      'If an account exists with this email, a password reset link has been sent.'
    )
  );
});

/**
 * POST /api/v1/auth/reset-password
 * Reset password using the token from email.
 */
const resetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { token, password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password');

  if (!user) {
    throw new ApiError(400, 'Invalid or expired password reset token. Please request a new one.');
  }

  // Update password
  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.refreshToken = null; // Invalidate all sessions
  await user.save();

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return res.status(200).json(
    new ApiResponse(200, {}, 'Password reset successful! Please log in with your new password.')
  );
});

/**
 * PUT /api/v1/auth/change-password
 * Change password for an authenticated user.
 */
const changePassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordCorrect) {
    throw new ApiError(400, 'Current password is incorrect.');
  }

  if (currentPassword === newPassword) {
    throw new ApiError(400, 'New password must be different from your current password.');
  }

  user.password = newPassword;
  user.refreshToken = null; // Invalidate all other sessions
  await user.save();

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return res.status(200).json(
    new ApiResponse(200, {}, 'Password changed successfully. Please log in again.')
  );
});

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
};
