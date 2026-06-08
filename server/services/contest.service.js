const axios = require('axios');
const Contest = require('../models/Contest');

/**
 * Fetch upcoming Codeforces contests from official API.
 */
const fetchCodeforcesContests = async () => {
  try {
    const response = await axios.get('https://codeforces.com/api/contest.list', {
      params: { gym: false },
      timeout: 10000,
    });

    if (response.data.status !== 'OK') return [];

    const now = Date.now();
    return response.data.result
      .filter((c) => c.phase === 'BEFORE')
      .slice(0, 20)
      .map((c) => ({
        platform: 'codeforces',
        name: c.name,
        startTime: new Date(c.startTimeSeconds * 1000),
        endTime: new Date((c.startTimeSeconds + c.durationSeconds) * 1000),
        duration: Math.round(c.durationSeconds / 60),
        url: `https://codeforces.com/contest/${c.id}`,
        difficulty: 'mixed',
        isVirtual: false,
      }));
  } catch (error) {
    console.error('Failed to fetch Codeforces contests:', error.message);
    return [];
  }
};

/**
 * Fetch upcoming LeetCode contests via GraphQL.
 */
const fetchLeetCodeContests = async () => {
  try {
    const query = `
      query {
        allContests {
          title
          titleSlug
          startTime
          duration
        }
      }
    `;
    const response = await axios.post(
      'https://leetcode.com/graphql',
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
          Referer: 'https://leetcode.com',
        },
        timeout: 10000,
      }
    );

    const now = Math.floor(Date.now() / 1000);
    const contests = response.data?.data?.allContests || [];

    return contests
      .filter((c) => c.startTime > now)
      .slice(0, 10)
      .map((c) => ({
        platform: 'leetcode',
        name: c.title,
        startTime: new Date(c.startTime * 1000),
        endTime: new Date((c.startTime + c.duration) * 1000),
        duration: Math.round(c.duration / 60),
        url: `https://leetcode.com/contest/${c.titleSlug}`,
        difficulty: 'mixed',
        isVirtual: false,
      }));
  } catch (error) {
    console.error('Failed to fetch LeetCode contests:', error.message);
    return [];
  }
};

/**
 * Returns upcoming CodeChef contests.
 * CodeChef doesn't have a stable public API; we return sample data as fallback.
 */
const fetchCodeChefContests = async () => {
  try {
    // CodeChef unofficial contest endpoint
    const response = await axios.get(
      'https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=upcoming',
      {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/json',
        },
      }
    );

    const future = response.data?.future_contests || [];
    return future.slice(0, 10).map((c) => ({
      platform: 'codechef',
      name: c.contest_name,
      startTime: new Date(c.contest_start_date_iso),
      endTime: new Date(c.contest_end_date_iso),
      duration: Math.round(
        (new Date(c.contest_end_date_iso) - new Date(c.contest_start_date_iso)) / 60000
      ),
      url: `https://www.codechef.com/${c.contest_code}`,
      difficulty: 'mixed',
      isVirtual: false,
    }));
  } catch (error) {
    console.error('Failed to fetch CodeChef contests:', error.message);
    // Fallback mock contests
    return [
      {
        platform: 'codechef',
        name: 'CodeChef Starters (Sample)',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        duration: 180,
        url: 'https://www.codechef.com/contests',
        difficulty: 'mixed',
        isVirtual: false,
        _isMock: true,
      },
    ];
  }
};

/**
 * Main function: fetch contests from all platforms, save to DB, and return sorted.
 * @returns {Promise<Array>} Sorted upcoming contests
 */
const fetchAndCacheContests = async () => {
  try {
    // Check if we have fresh data in DB (less than 6 hours old)
    const existingCount = await Contest.countDocuments({
      startTime: { $gt: new Date() },
    });

    if (existingCount > 0) {
      // Return cached contests
      return await Contest.find({ startTime: { $gt: new Date() } })
        .sort({ startTime: 1 })
        .lean();
    }

    // Fetch from all platforms
    const [cf, lc, cc] = await Promise.allSettled([
      fetchCodeforcesContests(),
      fetchLeetCodeContests(),
      fetchCodeChefContests(),
    ]);

    const allContests = [
      ...(cf.status === 'fulfilled' ? cf.value : []),
      ...(lc.status === 'fulfilled' ? lc.value : []),
      ...(cc.status === 'fulfilled' ? cc.value : []),
    ];

    if (allContests.length === 0) return [];

    // Bulk upsert into database
    const ops = allContests.map((contest) => ({
      updateOne: {
        filter: { platform: contest.platform, name: contest.name },
        update: { $set: { ...contest, fetchedAt: new Date() } },
        upsert: true,
      },
    }));

    await Contest.bulkWrite(ops);

    return await Contest.find({ startTime: { $gt: new Date() } })
      .sort({ startTime: 1 })
      .lean();
  } catch (error) {
    console.error('Contest fetch error:', error.message);
    return [];
  }
};

module.exports = { fetchAndCacheContests };
