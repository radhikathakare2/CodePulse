const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const PlatformStats = require('../models/PlatformStats');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../services/notification.service');

/**
 * POST /api/v1/friends/request/:userId
 * Send a friend request to another user.
 */
const sendRequest = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { userId: receiverId } = req.params;

  if (senderId.toString() === receiverId) {
    throw new ApiError(400, 'You cannot send a friend request to yourself.');
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new ApiError(404, 'User not found.');
  }

  // Check if already friends
  if (req.user.friends.includes(receiverId)) {
    throw new ApiError(400, 'You are already friends with this user.');
  }

  // Check for existing request
  const existing = await FriendRequest.findOne({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
    status: 'pending',
  });

  if (existing) {
    throw new ApiError(400, 'A friend request already exists between you and this user.');
  }

  const request = await FriendRequest.create({
    sender: senderId,
    receiver: receiverId,
  });

  // Notify the receiver
  await createNotification(
    receiverId,
    'friend_request',
    '👋 New Friend Request',
    `${req.user.name} (@${req.user.username}) sent you a friend request.`,
    { requestId: request._id, senderId, senderUsername: req.user.username }
  );

  return res.status(201).json(
    new ApiResponse(201, { request }, 'Friend request sent successfully.')
  );
});

/**
 * PUT /api/v1/friends/accept/:requestId
 * Accept a pending friend request.
 */
const acceptRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  const request = await FriendRequest.findOne({
    _id: requestId,
    receiver: userId,
    status: 'pending',
  });

  if (!request) {
    throw new ApiError(404, 'Friend request not found or already processed.');
  }

  // Update request status
  request.status = 'accepted';
  await request.save();

  // Add each user to the other's friends list
  await Promise.all([
    User.findByIdAndUpdate(userId, { $addToSet: { friends: request.sender } }),
    User.findByIdAndUpdate(request.sender, { $addToSet: { friends: userId } }),
  ]);

  // Notify the sender
  await createNotification(
    request.sender,
    'friend_request',
    '🎉 Friend Request Accepted',
    `${req.user.name} (@${req.user.username}) accepted your friend request!`,
    { userId, username: req.user.username }
  );

  return res.status(200).json(
    new ApiResponse(200, {}, 'Friend request accepted! You are now friends.')
  );
});

/**
 * PUT /api/v1/friends/reject/:requestId
 * Reject a pending friend request.
 */
const rejectRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  const request = await FriendRequest.findOneAndUpdate(
    { _id: requestId, receiver: userId, status: 'pending' },
    { status: 'rejected' },
    { new: true }
  );

  if (!request) {
    throw new ApiError(404, 'Friend request not found or already processed.');
  }

  return res.status(200).json(new ApiResponse(200, {}, 'Friend request rejected.'));
});

/**
 * DELETE /api/v1/friends/:friendId
 * Remove a friend from the user's friend list.
 */
const removeFriend = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { friendId } = req.params;

  const isFriend = req.user.friends.some((f) => f.toString() === friendId);
  if (!isFriend) {
    throw new ApiError(400, 'This user is not in your friends list.');
  }

  await Promise.all([
    User.findByIdAndUpdate(userId, { $pull: { friends: friendId } }),
    User.findByIdAndUpdate(friendId, { $pull: { friends: userId } }),
  ]);

  return res.status(200).json(new ApiResponse(200, {}, 'Friend removed successfully.'));
});

/**
 * GET /api/v1/friends/requests
 * Get all pending incoming friend requests.
 */
const getFriendRequests = asyncHandler(async (req, res) => {
  const requests = await FriendRequest.find({
    receiver: req.user._id,
    status: 'pending',
  })
    .populate('sender', 'name username profilePhoto bio currentRating')
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, { requests, total: requests.length }, 'Friend requests fetched.')
  );
});

/**
 * GET /api/v1/friends
 * Get all friends with their basic stats.
 */
const getFriends = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('friends', 'name username profilePhoto bio currentRating rank isPremium platformUsernames')
    .lean();

  const friends = user.friends || [];

  // Enrich with platform stats
  const friendIds = friends.map((f) => f._id);
  const platformStats = await PlatformStats.find({
    userId: { $in: friendIds },
  }).lean();

  const statsMap = {};
  platformStats.forEach((stat) => {
    if (!statsMap[stat.userId]) statsMap[stat.userId] = {};
    statsMap[stat.userId][stat.platform] = stat[stat.platform];
  });

  const enrichedFriends = friends.map((friend) => ({
    ...friend,
    platformStats: statsMap[friend._id] || {},
  }));

  return res.status(200).json(
    new ApiResponse(200, { friends: enrichedFriends, total: enrichedFriends.length }, 'Friends list fetched.')
  );
});

/**
 * GET /api/v1/friends/search?q=query
 * Search for users to add as friends.
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    throw new ApiError(400, 'Search query must be at least 2 characters.');
  }

  const regex = new RegExp(q.trim(), 'i');
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find({
    $or: [{ username: regex }, { name: regex }],
    _id: { $ne: req.user._id },
    isBanned: false,
  })
    .select('name username profilePhoto bio currentRating rank')
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  return res.status(200).json(
    new ApiResponse(200, { users, total: users.length }, 'User search results.')
  );
});

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  removeFriend,
  getFriendRequests,
  getFriends,
  searchUsers,
};
