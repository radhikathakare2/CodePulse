const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../services/notification.service');

/**
 * GET /api/v1/admin/stats
 * Dashboard overview stats.
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,
    premiumUsers,
    bannedUsers,
    newUsersThisMonth,
    newUsersLastMonth,
    totalRevenue,
    monthlyRevenue,
    totalSubscriptions,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isPremium: true }),
    User.countDocuments({ isBanned: true }),
    User.countDocuments({ createdAt: { $gte: thisMonthStart } }),
    User.countDocuments({
      createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
    }),
    Subscription.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Subscription.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Subscription.countDocuments({ status: 'paid' }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        premiumUsers,
        bannedUsers,
        newUsersThisMonth,
        newUsersLastMonth,
        userGrowthRate:
          newUsersLastMonth > 0
            ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
            : 100,
        totalRevenue: (totalRevenue[0]?.total || 0) / 100, // Convert paise to rupees
        monthlyRevenue: (monthlyRevenue[0]?.total || 0) / 100,
        totalSubscriptions,
      },
      'Dashboard stats fetched.'
    )
  );
});

/**
 * GET /api/v1/admin/users
 * Get all users with pagination and search.
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', filter } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {};

  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = [{ username: regex }, { name: regex }, { email: regex }];
  }

  if (filter === 'premium') query.isPremium = true;
  if (filter === 'banned') query.isBanned = true;
  if (filter === 'unverified') query.isEmailVerified = false;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshToken -resetPasswordToken -emailVerificationToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { users, total, page: parseInt(page), limit: parseInt(limit) },
      'Users fetched.'
    )
  );
});

/**
 * PUT /api/v1/admin/users/:id/ban
 * Ban a user account.
 */
const banUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason = 'Violation of terms of service' } = req.body;

  if (id === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot ban your own account.');
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isBanned: true, refreshToken: null },
    { new: true }
  ).select('name email username isBanned');

  if (!user) throw new ApiError(404, 'User not found.');

  await createNotification(
    id,
    'system',
    '⛔ Account Suspended',
    `Your account has been suspended. Reason: ${reason}. Contact support to appeal.`,
    { reason }
  );

  return res.status(200).json(
    new ApiResponse(200, { user }, `User @${user.username} has been banned.`)
  );
});

/**
 * PUT /api/v1/admin/users/:id/unban
 * Unban a user account.
 */
const unbanUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { isBanned: false },
    { new: true }
  ).select('name email username isBanned');

  if (!user) throw new ApiError(404, 'User not found.');

  await createNotification(
    id,
    'system',
    '✅ Account Reinstated',
    'Your CodePulse account has been reinstated. Welcome back!',
    {}
  );

  return res.status(200).json(
    new ApiResponse(200, { user }, `User @${user.username} has been unbanned.`)
  );
});

/**
 * GET /api/v1/admin/subscriptions
 * Get all subscriptions with pagination.
 */
const getAllSubscriptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {};
  if (status) query.status = status;

  const [subscriptions, total] = await Promise.all([
    Subscription.find(query)
      .populate('userId', 'name email username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Subscription.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { subscriptions, total, page: parseInt(page) },
      'Subscriptions fetched.'
    )
  );
});

/**
 * GET /api/v1/admin/revenue
 * Monthly revenue breakdown for the past 12 months.
 */
const getRevenueStats = asyncHandler(async (req, res) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const revenueByMonth = await Subscription.aggregate([
    {
      $match: {
        status: 'paid',
        createdAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue: { $sum: '$amount' },
        subscriptions: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const planBreakdown = await Subscription.aggregate([
    { $match: { status: 'paid' } },
    {
      $group: {
        _id: '$plan',
        count: { $sum: 1 },
        revenue: { $sum: '$amount' },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        revenueByMonth: revenueByMonth.map((r) => ({
          year: r._id.year,
          month: r._id.month,
          revenue: r.revenue / 100, // paise to rupees
          subscriptions: r.subscriptions,
        })),
        planBreakdown: planBreakdown.map((p) => ({
          plan: p._id,
          count: p.count,
          revenue: p.revenue / 100,
        })),
      },
      'Revenue stats fetched.'
    )
  );
});

/**
 * POST /api/v1/admin/contests
 * Manually add or update a contest.
 */
const manageContest = asyncHandler(async (req, res) => {
  const Contest = require('../models/Contest');
  const { action, contestId, ...contestData } = req.body;

  if (action === 'create') {
    if (!contestData.name || !contestData.startTime || !contestData.platform) {
      throw new ApiError(400, 'name, startTime, and platform are required.');
    }
    const contest = await Contest.create(contestData);
    return res.status(201).json(
      new ApiResponse(201, { contest }, 'Contest created.')
    );
  }

  if (action === 'update') {
    const contest = await Contest.findByIdAndUpdate(contestId, contestData, { new: true });
    if (!contest) throw new ApiError(404, 'Contest not found.');
    return res.status(200).json(new ApiResponse(200, { contest }, 'Contest updated.'));
  }

  if (action === 'delete') {
    const contest = await Contest.findByIdAndDelete(contestId);
    if (!contest) throw new ApiError(404, 'Contest not found.');
    return res.status(200).json(new ApiResponse(200, {}, 'Contest deleted.'));
  }

  throw new ApiError(400, 'Invalid action. Use: create, update, or delete.');
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  banUser,
  unbanUser,
  getAllSubscriptions,
  getRevenueStats,
  manageContest,
};
