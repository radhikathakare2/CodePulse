const PlatformStats = require('../models/PlatformStats');

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if cached platform stats are still fresh (within 15 min).
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} platform - 'leetcode' | 'codeforces' | 'gfg'
 * @returns {Promise<object|null>} Cached stats or null if stale/missing
 */
const getCachedStats = async (userId, platform) => {
  const cached = await PlatformStats.findOne({ userId, platform });
  if (!cached) return null;

  const age = Date.now() - new Date(cached.lastUpdated).getTime();
  if (age < CACHE_TTL_MS) {
    return cached;
  }
  return null; // stale
};

/**
 * Save or update platform stats in the cache.
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} platform - 'leetcode' | 'codeforces' | 'gfg'
 * @param {object} data - Platform-specific stats object
 * @returns {Promise<object>} Updated PlatformStats document
 */
const upsertStats = async (userId, platform, data) => {
  const updated = await PlatformStats.findOneAndUpdate(
    { userId, platform },
    {
      userId,
      platform,
      [platform]: data,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true, runValidators: true }
  );
  return updated;
};

/**
 * Invalidate cached stats for a user+platform combination.
 * @param {string} userId
 * @param {string} platform
 */
const invalidateCache = async (userId, platform) => {
  await PlatformStats.deleteOne({ userId, platform });
};

module.exports = { getCachedStats, upsertStats, invalidateCache };
