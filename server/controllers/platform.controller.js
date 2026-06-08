const PlatformStats = require('../models/PlatformStats');
const User = require('../models/User');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getCachedStats, upsertStats } = require('../utils/platformCache');
const { fetchLeetCodeStats } = require('../services/leetcode.service');
const { fetchCodeforcesStats } = require('../services/codeforces.service');
const { fetchGFGStats } = require('../services/gfg.service');

/**
 * POST /api/v1/platforms/sync/leetcode
 * Sync LeetCode stats for the authenticated user.
 */
const syncLeetCode = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user.platformUsernames?.leetcode) {
    throw new ApiError(400, 'LeetCode username not set. Please update your profile first.');
  }

  // Check cache first
  const cached = await getCachedStats(user._id, 'leetcode');
  if (cached) {
    return res.status(200).json(
      new ApiResponse(200, { stats: cached.leetcode, cached: true }, 'LeetCode stats (cached).')
    );
  }

  // Fetch fresh data
  const stats = await fetchLeetCodeStats(user.platformUsernames.leetcode);

  // Save to cache
  const savedStats = await upsertStats(user._id, 'leetcode', stats);

  // Update user's overall rating
  if (stats.contestRating > 0) {
    await User.findByIdAndUpdate(user._id, {
      currentRating: stats.contestRating,
    });
  }

  return res.status(200).json(
    new ApiResponse(200, { stats: savedStats.leetcode, cached: false }, 'LeetCode stats synced.')
  );
});

/**
 * POST /api/v1/platforms/sync/codeforces
 * Sync Codeforces stats for the authenticated user.
 */
const syncCodeforces = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user.platformUsernames?.codeforces) {
    throw new ApiError(400, 'Codeforces handle not set. Please update your profile first.');
  }

  // Check cache
  const cached = await getCachedStats(user._id, 'codeforces');
  if (cached) {
    return res.status(200).json(
      new ApiResponse(200, { stats: cached.codeforces, cached: true }, 'Codeforces stats (cached).')
    );
  }

  const stats = await fetchCodeforcesStats(user.platformUsernames.codeforces);
  const savedStats = await upsertStats(user._id, 'codeforces', stats);

  // Update user's rating and rank
  if (stats.rating > 0) {
    await User.findByIdAndUpdate(user._id, {
      currentRating: stats.rating,
      rank: stats.rank || user.rank,
    });
  }

  return res.status(200).json(
    new ApiResponse(200, { stats: savedStats.codeforces, cached: false }, 'Codeforces stats synced.')
  );
});

/**
 * POST /api/v1/platforms/sync/gfg
 * Sync GFG stats for the authenticated user.
 */
const syncGFG = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user.platformUsernames?.gfg) {
    throw new ApiError(400, 'GFG username not set. Please update your profile first.');
  }

  // Check cache
  const cached = await getCachedStats(user._id, 'gfg');
  if (cached) {
    return res.status(200).json(
      new ApiResponse(200, { stats: cached.gfg, cached: true }, 'GFG stats (cached).')
    );
  }

  const stats = await fetchGFGStats(user.platformUsernames.gfg);
  const savedStats = await upsertStats(user._id, 'gfg', stats);

  return res.status(200).json(
    new ApiResponse(200, { stats: savedStats.gfg, cached: false }, 'GFG stats synced.')
  );
});

/**
 * GET /api/v1/platforms/stats
 * Get all cached platform stats for the authenticated user.
 */
const getAllStats = asyncHandler(async (req, res) => {
  const platformStats = await PlatformStats.find({ userId: req.user._id }).lean();

  const result = {
    leetcode: null,
    codeforces: null,
    gfg: null,
  };

  platformStats.forEach((stat) => {
    result[stat.platform] = {
      data: stat[stat.platform],
      lastUpdated: stat.lastUpdated,
    };
  });

  return res.status(200).json(
    new ApiResponse(200, result, 'Platform stats fetched successfully.')
  );
});

/**
 * GET /api/v1/platforms/calendar
 * Get contribution/heatmap calendar data from LeetCode.
 */
const getContributionCalendar = asyncHandler(async (req, res) => {
  const lcStats = await PlatformStats.findOne({
    userId: req.user._id,
    platform: 'leetcode',
  }).lean();

  let calendarData = {};
  if (lcStats?.leetcode?.submissionCalendar) {
    calendarData = Object.fromEntries(lcStats.leetcode.submissionCalendar);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { calendar: calendarData, streak: lcStats?.leetcode?.streak || 0 },
      'Contribution calendar fetched.'
    )
  );
});

module.exports = {
  syncLeetCode,
  syncCodeforces,
  syncGFG,
  getAllStats,
  getContributionCalendar,
};
