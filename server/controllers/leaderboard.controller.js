const User = require('../models/User');
const PlatformStats = require('../models/PlatformStats');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Calculate a composite score for ranking users.
 * Weights: 60% total problems solved + 40% contest rating
 */
const calculateScore = (lcStats, cfStats, gfgStats) => {
  const totalSolved =
    (lcStats?.totalSolved || 0) +
    (gfgStats?.totalSolved || 0);
  const rating = Math.max(
    lcStats?.contestRating || 0,
    cfStats?.rating || 0
  );
  return totalSolved * 0.6 + rating * 0.4;
};

/**
 * GET /api/v1/leaderboard/global
 * Global leaderboard based on composite score.
 */
const getGlobalLeaderboard = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get all users (non-banned)
  const users = await User.find({ isBanned: false })
    .select('name username profilePhoto currentRating rank isPremium country')
    .lean();

  const userIds = users.map((u) => u._id);

  // Get all platform stats
  const allStats = await PlatformStats.find({ userId: { $in: userIds } }).lean();

  // Build stats map
  const statsMap = {};
  allStats.forEach((s) => {
    if (!statsMap[s.userId]) statsMap[s.userId] = {};
    statsMap[s.userId][s.platform] = s[s.platform];
  });

  // Compute scores
  const ranked = users
    .map((user) => {
      const uStats = statsMap[user._id] || {};
      const score = calculateScore(uStats.leetcode, uStats.codeforces, uStats.gfg);
      return {
        ...user,
        totalSolved:
          (uStats.leetcode?.totalSolved || 0) + (uStats.gfg?.totalSolved || 0),
        contestRating: Math.max(
          uStats.leetcode?.contestRating || 0,
          uStats.codeforces?.rating || 0
        ),
        score: Math.round(score),
      };
    })
    .filter((u) => u.totalSolved > 0 || u.contestRating > 0)
    .sort((a, b) => b.score - a.score)
    .map((u, idx) => ({ ...u, globalRank: idx + 1 }));

  const total = ranked.length;
  const paginated = ranked.slice(skip, skip + parseInt(limit));

  // Find current user's rank
  const myRank = ranked.findIndex(
    (u) => u._id.toString() === req.user._id.toString()
  ) + 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      { leaderboard: paginated, total, page: parseInt(page), myRank: myRank || null },
      'Global leaderboard fetched.'
    )
  );
});

/**
 * GET /api/v1/leaderboard/friends
 * Friend leaderboard — shows rankings among the user's friends.
 */
const getFriendLeaderboard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'friends',
    'name username profilePhoto currentRating rank isPremium'
  );

  const friendIds = user.friends.map((f) => f._id);
  // Include self
  const participantIds = [...friendIds, req.user._id];

  const participants = await User.find({ _id: { $in: participantIds } })
    .select('name username profilePhoto currentRating rank isPremium')
    .lean();

  const allStats = await PlatformStats.find({
    userId: { $in: participantIds },
  }).lean();

  const statsMap = {};
  allStats.forEach((s) => {
    if (!statsMap[s.userId]) statsMap[s.userId] = {};
    statsMap[s.userId][s.platform] = s[s.platform];
  });

  const ranked = participants
    .map((p) => {
      const uStats = statsMap[p._id] || {};
      const score = calculateScore(uStats.leetcode, uStats.codeforces, uStats.gfg);
      return {
        ...p,
        totalSolved:
          (uStats.leetcode?.totalSolved || 0) + (uStats.gfg?.totalSolved || 0),
        contestRating: Math.max(
          uStats.leetcode?.contestRating || 0,
          uStats.codeforces?.rating || 0
        ),
        score: Math.round(score),
        isMe: p._id.toString() === req.user._id.toString(),
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((p, idx) => ({ ...p, rank: idx + 1 }));

  return res.status(200).json(
    new ApiResponse(200, { leaderboard: ranked }, 'Friend leaderboard fetched.')
  );
});

/**
 * GET /api/v1/leaderboard/weekly
 * Weekly leaderboard — simulated by rating change over the past week.
 * (Without actual submission history per user, this is based on current stats proxy)
 */
const getWeeklyLeaderboard = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Fetch users who updated stats in the past 7 days
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentStats = await PlatformStats.find({
    lastUpdated: { $gte: oneWeekAgo },
  })
    .populate('userId', 'name username profilePhoto isPremium')
    .lean();

  const userMap = {};
  recentStats.forEach((s) => {
    if (!s.userId) return;
    const uid = s.userId._id.toString();
    if (!userMap[uid]) {
      userMap[uid] = { user: s.userId, weeklyScore: 0 };
    }
    if (s.platform === 'codeforces' && s.codeforces?.contestHistory?.length > 0) {
      const recentContests = s.codeforces.contestHistory.filter(
        (c) => new Date(c.time * 1000) >= oneWeekAgo
      );
      const weeklyRatingGain = recentContests.reduce(
        (sum, c) => sum + (c.ratingChange || 0),
        0
      );
      userMap[uid].weeklyScore += Math.max(weeklyRatingGain, 0);
    }
    if (s.platform === 'leetcode') {
      userMap[uid].weeklyScore += (s.leetcode?.totalSolved || 0) * 2;
    }
  });

  const ranked = Object.values(userMap)
    .filter((u) => u.weeklyScore > 0)
    .sort((a, b) => b.weeklyScore - a.weeklyScore)
    .map((u, idx) => ({ ...u.user, weeklyScore: u.weeklyScore, rank: idx + 1 }));

  const total = ranked.length;
  const paginated = ranked.slice(skip, skip + parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, { leaderboard: paginated, total, page: parseInt(page) }, 'Weekly leaderboard fetched.')
  );
});

/**
 * GET /api/v1/leaderboard/monthly
 * Monthly leaderboard.
 */
const getMonthlyLeaderboard = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const recentStats = await PlatformStats.find({
    lastUpdated: { $gte: oneMonthAgo },
  })
    .populate('userId', 'name username profilePhoto isPremium currentRating rank')
    .lean();

  const userMap = {};
  recentStats.forEach((s) => {
    if (!s.userId) return;
    const uid = s.userId._id.toString();
    if (!userMap[uid]) {
      userMap[uid] = { user: s.userId, monthlyScore: 0 };
    }
    const score = calculateScore(
      s.platform === 'leetcode' ? s.leetcode : null,
      s.platform === 'codeforces' ? s.codeforces : null,
      s.platform === 'gfg' ? s.gfg : null
    );
    userMap[uid].monthlyScore += score;
  });

  const ranked = Object.values(userMap)
    .sort((a, b) => b.monthlyScore - a.monthlyScore)
    .map((u, idx) => ({
      ...u.user,
      monthlyScore: Math.round(u.monthlyScore),
      rank: idx + 1,
    }));

  const total = ranked.length;
  const paginated = ranked.slice(skip, skip + parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, { leaderboard: paginated, total, page: parseInt(page) }, 'Monthly leaderboard fetched.')
  );
});

module.exports = {
  getGlobalLeaderboard,
  getFriendLeaderboard,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
};
