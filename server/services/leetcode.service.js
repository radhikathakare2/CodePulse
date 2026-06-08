const axios = require('axios');

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

/**
 * GraphQL query: Fetch user profile (ranking, reputation, etc.)
 */
const USER_PROFILE_QUERY = `
  query userPublicProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        reputation
        starRating
      }
    }
  }
`;

/**
 * GraphQL query: Fetch problem solving stats
 */
const USER_PROBLEMS_QUERY = `
  query userProblemsSolved($username: String!) {
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
  }
`;

/**
 * GraphQL query: Fetch contest ranking
 */
const USER_CONTEST_QUERY = `
  query userContestRanking($username: String!) {
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
    }
  }
`;

/**
 * GraphQL query: Fetch recent accepted submissions
 */
const RECENT_SUBMISSIONS_QUERY = `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }
`;

/**
 * GraphQL query: User submission calendar
 */
const SUBMISSION_CALENDAR_QUERY = `
  query userProfileCalendar($username: String!, $year: Int) {
    matchedUser(username: $username) {
      userCalendar(year: $year) {
        submissionCalendar
        streak
        totalActiveDays
      }
    }
  }
`;

/**
 * Execute a GraphQL query against LeetCode API.
 */
const queryLeetCode = async (query, variables = {}) => {
  const response = await axios.post(
    LEETCODE_GRAPHQL_URL,
    { query, variables },
    {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://leetcode.com',
      },
      timeout: 10000,
    }
  );
  return response.data;
};

/**
 * Fetch comprehensive LeetCode stats for a given username.
 * Falls back to mock data on failure.
 * @param {string} username - LeetCode username
 * @returns {Promise<object>} Structured stats matching PlatformStats.leetcode schema
 */
const fetchLeetCodeStats = async (username) => {
  try {
    // Fetch all data in parallel
    const [profileRes, problemsRes, contestRes, submissionsRes, calendarRes] =
      await Promise.allSettled([
        queryLeetCode(USER_PROFILE_QUERY, { username }),
        queryLeetCode(USER_PROBLEMS_QUERY, { username }),
        queryLeetCode(USER_CONTEST_QUERY, { username }),
        queryLeetCode(RECENT_SUBMISSIONS_QUERY, { username, limit: 10 }),
        queryLeetCode(SUBMISSION_CALENDAR_QUERY, {
          username,
          year: new Date().getFullYear(),
        }),
      ]);

    // Parse solved counts
    let totalSolved = 0, easySolved = 0, mediumSolved = 0, hardSolved = 0, acceptanceRate = 0;
    if (problemsRes.status === 'fulfilled') {
      const acNums =
        problemsRes.value?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
      acNums.forEach((item) => {
        if (item.difficulty === 'All') {
          totalSolved = item.count;
          acceptanceRate =
            item.submissions > 0
              ? Math.round((item.count / item.submissions) * 100 * 10) / 10
              : 0;
        } else if (item.difficulty === 'Easy') easySolved = item.count;
        else if (item.difficulty === 'Medium') mediumSolved = item.count;
        else if (item.difficulty === 'Hard') hardSolved = item.count;
      });
    }

    // Parse ranking
    let ranking = 0;
    if (profileRes.status === 'fulfilled') {
      ranking = profileRes.value?.data?.matchedUser?.profile?.ranking || 0;
    }

    // Parse contest rating
    let contestRating = 0;
    if (contestRes.status === 'fulfilled') {
      contestRating = Math.round(
        contestRes.value?.data?.userContestRanking?.rating || 0
      );
    }

    // Parse calendar and streak
    let streak = 0;
    let submissionCalendar = {};
    if (calendarRes.status === 'fulfilled') {
      const cal = calendarRes.value?.data?.matchedUser?.userCalendar;
      if (cal) {
        streak = cal.streak || 0;
        try {
          submissionCalendar = JSON.parse(cal.submissionCalendar || '{}');
        } catch {
          submissionCalendar = {};
        }
      }
    }

    // Parse recent submissions
    let recentSubmissions = [];
    if (submissionsRes.status === 'fulfilled') {
      const raw = submissionsRes.value?.data?.recentAcSubmissionList || [];
      recentSubmissions = raw.map((s) => ({
        title: s.title,
        titleSlug: s.titleSlug,
        timestamp: s.timestamp,
        status: s.statusDisplay,
        lang: s.lang,
      }));
    }

    return {
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      acceptanceRate,
      ranking,
      contestRating,
      streak,
      submissionCalendar,
      recentSubmissions,
    };
  } catch (error) {
    console.error(`LeetCode API error for ${username}:`, error.message);
    // Return mock data so the platform page still renders
    return getMockLeetCodeData(username);
  }
};

/**
 * Returns mock LeetCode data when the API is unavailable.
 */
const getMockLeetCodeData = (username) => ({
  totalSolved: 0,
  easySolved: 0,
  mediumSolved: 0,
  hardSolved: 0,
  acceptanceRate: 0,
  ranking: 0,
  contestRating: 0,
  streak: 0,
  submissionCalendar: {},
  recentSubmissions: [],
  _isMock: true,
  _note: `Could not fetch live data for ${username}. Please check the username and try again.`,
});

module.exports = { fetchLeetCodeStats };
