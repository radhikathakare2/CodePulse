const Group = require('../models/Group');
const Message = require('../models/Message');
const User = require('../models/User');
const PlatformStats = require('../models/PlatformStats');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../services/notification.service');

/**
 * POST /api/v1/groups
 * Create a new group. Creator is automatically set as admin.
 */
const createGroup = asyncHandler(async (req, res) => {
  const { name, description, isPublic = true, weeklyGoal = 5, tags = [] } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, 'Group name is required.');
  }

  const group = await Group.create({
    name: name.trim(),
    description: description?.trim() || '',
    isPublic,
    weeklyGoal,
    tags,
    creator: req.user._id,
    members: [{ userId: req.user._id, role: 'admin', joinedAt: new Date() }],
  });

  await group.populate('creator', 'name username profilePhoto');

  return res.status(201).json(
    new ApiResponse(201, { group }, 'Group created successfully!')
  );
});

/**
 * POST /api/v1/groups/join
 * Join a group using an invite code.
 */
const joinGroup = asyncHandler(async (req, res) => {
  const { inviteCode } = req.body;

  if (!inviteCode) {
    throw new ApiError(400, 'Invite code is required.');
  }

  const group = await Group.findOne({ inviteCode: inviteCode.toUpperCase().trim() });
  if (!group) {
    throw new ApiError(404, 'Invalid invite code. No group found.');
  }

  const isMember = group.members.some(
    (m) => m.userId.toString() === req.user._id.toString()
  );
  if (isMember) {
    throw new ApiError(400, 'You are already a member of this group.');
  }

  if (group.members.length >= group.maxMembers) {
    throw new ApiError(400, `This group is full (max ${group.maxMembers} members).`);
  }

  group.members.push({ userId: req.user._id, role: 'member', joinedAt: new Date() });
  await group.save();

  // Send system message
  await Message.create({
    group: group._id,
    sender: req.user._id,
    content: `${req.user.name} joined the group.`,
    type: 'system',
  });

  return res.status(200).json(
    new ApiResponse(200, { group }, 'Joined group successfully!')
  );
});

/**
 * DELETE /api/v1/groups/:id/leave
 * Leave a group.
 */
const leaveGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, 'Group not found.');

  const memberIndex = group.members.findIndex(
    (m) => m.userId.toString() === userId.toString()
  );
  if (memberIndex === -1) {
    throw new ApiError(400, 'You are not a member of this group.');
  }

  // Creator cannot leave if they're the only admin
  const isCreator = group.creator.toString() === userId.toString();
  const adminCount = group.members.filter((m) => m.role === 'admin').length;

  if (isCreator && adminCount === 1 && group.members.length > 1) {
    throw new ApiError(
      400,
      'You are the only admin. Transfer admin role to another member before leaving.'
    );
  }

  group.members.splice(memberIndex, 1);

  // If no members left, delete the group
  if (group.members.length === 0) {
    await group.deleteOne();
    return res.status(200).json(new ApiResponse(200, {}, 'Group disbanded (no members left).'));
  }

  await group.save();

  await Message.create({
    group: group._id,
    sender: userId,
    content: `${req.user.name} left the group.`,
    type: 'system',
  });

  return res.status(200).json(new ApiResponse(200, {}, 'Left group successfully.'));
});

/**
 * POST /api/v1/groups/:id/invite
 * Invite a user to the group (admin only).
 */
const inviteMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId: targetUserId } = req.body;

  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, 'Group not found.');

  const requester = group.members.find(
    (m) => m.userId.toString() === req.user._id.toString()
  );
  if (!requester || requester.role !== 'admin') {
    throw new ApiError(403, 'Only group admins can invite members.');
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new ApiError(404, 'User not found.');

  const alreadyMember = group.members.some(
    (m) => m.userId.toString() === targetUserId
  );
  if (alreadyMember) throw new ApiError(400, 'User is already a member.');

  if (group.members.length >= group.maxMembers) {
    throw new ApiError(400, `Group is full (max ${group.maxMembers} members).`);
  }

  // Send invite notification
  await createNotification(
    targetUserId,
    'group_invite',
    `📬 Group Invite: ${group.name}`,
    `${req.user.name} invited you to join the group "${group.name}". Use invite code: ${group.inviteCode}`,
    { groupId: group._id, groupName: group.name, inviteCode: group.inviteCode }
  );

  return res.status(200).json(
    new ApiResponse(200, { inviteCode: group.inviteCode }, 'Invite sent successfully.')
  );
});

/**
 * GET /api/v1/groups/:id
 * Get group details.
 */
const getGroupDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const group = await Group.findById(id)
    .populate('creator', 'name username profilePhoto')
    .populate('members.userId', 'name username profilePhoto currentRating rank')
    .lean();

  if (!group) throw new ApiError(404, 'Group not found.');

  // Check membership for private groups
  if (!group.isPublic) {
    const isMember = group.members.some(
      (m) => m.userId._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      throw new ApiError(403, 'This group is private. You need an invite to view it.');
    }
  }

  return res.status(200).json(
    new ApiResponse(200, { group }, 'Group details fetched.')
  );
});

/**
 * GET /api/v1/groups
 * Get all groups the authenticated user belongs to.
 */
const getUserGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ 'members.userId': req.user._id })
    .populate('creator', 'name username profilePhoto')
    .select('name description avatar members maxMembers isPublic weeklyGoal tags inviteCode createdAt')
    .lean();

  const enriched = groups.map((g) => ({
    ...g,
    memberCount: g.members.length,
  }));

  return res.status(200).json(
    new ApiResponse(200, { groups: enriched, total: enriched.length }, 'Your groups fetched.')
  );
});

/**
 * GET /api/v1/groups/:id/leaderboard
 * Get the group leaderboard sorted by total problems solved.
 */
const getGroupLeaderboard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const group = await Group.findById(id).populate(
    'members.userId',
    'name username profilePhoto currentRating rank'
  );

  if (!group) throw new ApiError(404, 'Group not found.');

  const memberIds = group.members.map((m) => m.userId._id);

  // Get platform stats for all members
  const stats = await PlatformStats.find({ userId: { $in: memberIds } }).lean();

  const statsMap = {};
  stats.forEach((s) => {
    if (!statsMap[s.userId]) statsMap[s.userId] = { totalSolved: 0, rating: 0 };
    if (s.platform === 'leetcode') {
      statsMap[s.userId].totalSolved += s.leetcode?.totalSolved || 0;
      statsMap[s.userId].rating = Math.max(
        statsMap[s.userId].rating,
        s.leetcode?.contestRating || 0
      );
    }
    if (s.platform === 'codeforces') {
      statsMap[s.userId].rating = Math.max(
        statsMap[s.userId].rating,
        s.codeforces?.rating || 0
      );
    }
    if (s.platform === 'gfg') {
      statsMap[s.userId].totalSolved += s.gfg?.totalSolved || 0;
    }
  });

  const leaderboard = group.members
    .map((m) => ({
      user: m.userId,
      role: m.role,
      joinedAt: m.joinedAt,
      totalSolved: statsMap[m.userId._id]?.totalSolved || 0,
      rating: statsMap[m.userId._id]?.rating || 0,
    }))
    .sort((a, b) => b.totalSolved - a.totalSolved || b.rating - a.rating)
    .map((m, idx) => ({ ...m, rank: idx + 1 }));

  return res.status(200).json(
    new ApiResponse(200, { leaderboard }, 'Group leaderboard fetched.')
  );
});

/**
 * POST /api/v1/groups/:id/messages
 * Send a message to a group chat.
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, 'Message content is required.');
  }

  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, 'Group not found.');

  const isMember = group.members.some(
    (m) => m.userId.toString() === req.user._id.toString()
  );
  if (!isMember) {
    throw new ApiError(403, 'You must be a member to send messages.');
  }

  const message = await Message.create({
    group: id,
    sender: req.user._id,
    content: content.trim(),
    type: 'text',
    readBy: [req.user._id],
  });

  await message.populate('sender', 'name username profilePhoto');

  return res.status(201).json(
    new ApiResponse(201, { message }, 'Message sent.')
  );
});

/**
 * GET /api/v1/groups/:id/messages
 * Get paginated group messages.
 */
const getMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, 'Group not found.');

  const isMember = group.members.some(
    (m) => m.userId.toString() === req.user._id.toString()
  );
  if (!isMember) {
    throw new ApiError(403, 'You must be a member to view messages.');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [messages, total] = await Promise.all([
    Message.find({ group: id })
      .populate('sender', 'name username profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Message.countDocuments({ group: id }),
  ]);

  // Mark as read (non-blocking)
  Message.updateMany(
    { group: id, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  ).catch(() => {});

  return res.status(200).json(
    new ApiResponse(
      200,
      { messages: messages.reverse(), total, page: parseInt(page) },
      'Messages fetched.'
    )
  );
});

/**
 * PUT /api/v1/groups/:id
 * Update group details (admin only).
 */
const updateGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, 'Group not found.');

  const member = group.members.find(
    (m) => m.userId.toString() === req.user._id.toString()
  );
  if (!member || member.role !== 'admin') {
    throw new ApiError(403, 'Only group admins can update group details.');
  }

  const allowedUpdates = ['name', 'description', 'isPublic', 'weeklyGoal', 'tags'];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      group[field] = req.body[field];
    }
  });

  await group.save();

  return res.status(200).json(
    new ApiResponse(200, { group }, 'Group updated successfully.')
  );
});

module.exports = {
  createGroup,
  joinGroup,
  leaveGroup,
  inviteMember,
  getGroupDetails,
  getUserGroups,
  getGroupLeaderboard,
  sendMessage,
  getMessages,
  updateGroup,
};
