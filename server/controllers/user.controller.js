const { validationResult } = require('express-validator');
const User = require('../models/User');
const PlatformStats = require('../models/PlatformStats');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

/**
 * GET /api/v1/users/profile
 * Return the authenticated user's full profile with platform stats.
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  // Fetch all platform stats
  const platformStats = await PlatformStats.find({ userId: user._id }).lean();

  const statsMap = {};
  platformStats.forEach((stat) => {
    statsMap[stat.platform] = stat[stat.platform];
  });

  return res.status(200).json(
    new ApiResponse(200, { user, platformStats: statsMap }, 'Profile fetched successfully.')
  );
});

/**
 * PUT /api/v1/users/profile
 * Update the authenticated user's profile fields.
 */
const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const allowedFields = [
    'name',
    'bio',
    'college',
    'country',
    'githubUrl',
    'platformUsernames',
  ];

  const updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  // Handle nested platformUsernames update
  if (updateData.platformUsernames) {
    const existing = req.user.platformUsernames || {};
    updateData.platformUsernames = {
      ...existing,
      ...updateData.platformUsernames,
    };
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, { user: updatedUser }, 'Profile updated successfully.')
  );
});

/**
 * POST /api/v1/users/avatar
 * Upload and update profile photo via Cloudinary.
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file provided.');
  }

  const user = req.user;

  // Delete old photo if exists
  if (user.profilePhoto?.public_id) {
    await deleteFromCloudinary(user.profilePhoto.public_id);
  }

  // Upload new photo to Cloudinary
  const result = await uploadToCloudinary(
    req.file.buffer,
    'codepulse/avatars',
    `avatar_${user._id}`
  );

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      profilePhoto: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { profilePhoto: updatedUser.profilePhoto },
      'Profile photo updated successfully.'
    )
  );
});

/**
 * DELETE /api/v1/users/account
 * Permanently delete the authenticated user's account.
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const user = req.user;

  // Delete profile photo from Cloudinary
  if (user.profilePhoto?.public_id) {
    await deleteFromCloudinary(user.profilePhoto.public_id);
  }

  // Delete user's data (cascade)
  await Promise.all([
    PlatformStats.deleteMany({ userId: user._id }),
    User.findByIdAndDelete(user._id),
  ]);

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return res.status(200).json(
    new ApiResponse(200, {}, 'Account deleted successfully. We\'re sorry to see you go!')
  );
});

/**
 * GET /api/v1/users/search?q=query
 * Search users by username or name.
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    throw new ApiError(400, 'Search query must be at least 2 characters.');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const regex = new RegExp(q.trim(), 'i');

  const [users, total] = await Promise.all([
    User.find({
      $or: [{ username: regex }, { name: regex }],
      _id: { $ne: req.user._id }, // Exclude self
      isBanned: false,
    })
      .select('name username profilePhoto bio college currentRating rank isPremium')
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments({
      $or: [{ username: regex }, { name: regex }],
      _id: { $ne: req.user._id },
      isBanned: false,
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { users, total, page: parseInt(page), limit: parseInt(limit) },
      'Search results fetched.'
    )
  );
});

/**
 * GET /api/v1/users/public/:username
 * Get public profile of any user (no auth required).
 */
const getPublicProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username, isBanned: false })
    .select(
      'name username profilePhoto bio college country githubUrl currentRating rank isPremium achievementBadges platformUsernames createdAt'
    )
    .lean();

  if (!user) {
    throw new ApiError(404, `User "${username}" not found.`);
  }

  // Get public platform stats
  const platformStats = await PlatformStats.find({ userId: user._id }).lean();
  const statsMap = {};
  platformStats.forEach((stat) => {
    statsMap[stat.platform] = stat[stat.platform];
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { user, platformStats: statsMap },
      'Public profile fetched successfully.'
    )
  );
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  searchUsers,
  getPublicProfile,
};
