const axios = require('axios');

const CF_API_BASE = 'https://codeforces.com/api';

/**
 * Make a GET request to the Codeforces API.
 * @param {string} endpoint - API endpoint (e.g., 'user.info')
 * @param {object} params - Query params
 */
const cfRequest = async (endpoint, params = {}) => {
  const response = await axios.get(`${CF_API_BASE}/${endpoint}`, {
    params,
    timeout: 10000,
    headers: {
      'User-Agent': 'CodePulse-Analytics/1.0',
    },
  });
  if (response.data.status !== 'OK') {
    throw new Error(`Codeforces API error: ${response.data.comment}`);
  }
  return response.data.result;
};

/**
 * Fetch comprehensive Codeforces stats for a user handle.
 * @param {string} handle - Codeforces handle
 * @returns {Promise<object>} Structured stats matching PlatformStats.codeforces schema
 */
const fetchCodeforcesStats = async (handle) => {
  try {
    // Fetch user info, rating history, and recent submissions in parallel
    const [userInfo, ratingHistory, recentStatus] = await Promise.allSettled([
      cfRequest('user.info', { handles: handle }),
      cfRequest('user.rating', { handle }),
      cfRequest('user.status', { handle, from: 1, count: 15 }),
    ]);

    // Parse user info
    let userDetails = {};
    if (userInfo.status === 'fulfilled' && userInfo.value.length > 0) {
      const u = userInfo.value[0];
      userDetails = {
        handle: u.handle,
        rating: u.rating || 0,
        rank: u.rank || 'unrated',
        maxRating: u.maxRating || 0,
        maxRank: u.maxRank || 'unrated',
        contribution: u.contribution || 0,
        friendOfCount: u.friendOfCount || 0,
      };
    } else {
      userDetails = {
        handle,
        rating: 0,
        rank: 'unrated',
        maxRating: 0,
        maxRank: 'unrated',
        contribution: 0,
        friendOfCount: 0,
      };
    }

    // Parse contest history (last 20 contests)
    let contestHistory = [];
    if (ratingHistory.status === 'fulfilled') {
      contestHistory = ratingHistory.value
        .slice(-20)
        .reverse()
        .map((c) => ({
          contestId: c.contestId,
          contestName: c.contestName,
          rank: c.rank,
          oldRating: c.oldRating,
          newRating: c.newRating,
          ratingChange: c.newRating - c.oldRating,
          time: c.ratingUpdateTimeSeconds,
        }));
    }

    // Parse recent accepted problems
    let recentProblems = [];
    if (recentStatus.status === 'fulfilled') {
      const seen = new Set();
      recentProblems = recentStatus.value
        .filter((s) => {
          const key = `${s.problem.contestId}-${s.problem.index}`;
          if (s.verdict === 'OK' && !seen.has(key)) {
            seen.add(key);
            return true;
          }
          return false;
        })
        .slice(0, 10)
        .map((s) => ({
          name: s.problem.name,
          tags: s.problem.tags || [],
          rating: s.problem.rating || 0,
          verdict: s.verdict,
        }));
    }

    return {
      ...userDetails,
      contestHistory,
      recentProblems,
    };
  } catch (error) {
    console.error(`Codeforces API error for ${handle}:`, error.message);
    return getMockCodeforcesData(handle);
  }
};

/**
 * Returns mock Codeforces data when the API is unavailable.
 */
const getMockCodeforcesData = (handle) => ({
  handle,
  rating: 0,
  rank: 'unrated',
  maxRating: 0,
  maxRank: 'unrated',
  contribution: 0,
  friendOfCount: 0,
  contestHistory: [],
  recentProblems: [],
  _isMock: true,
  _note: `Could not fetch live data for ${handle}. Please verify the handle and try again.`,
});

module.exports = { fetchCodeforcesStats };
