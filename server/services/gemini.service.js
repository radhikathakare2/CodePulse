const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

/**
 * Initialize Gemini AI lazily (only if API key is set).
 */
const getModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }
  return model;
};

/**
 * Parse JSON from Gemini's response text (handles markdown code blocks).
 */
const parseGeminiJSON = (text) => {
  // Remove markdown code fences if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
};

/**
 * Generate a weak topic analysis based on the user's platform stats.
 * @param {string} userId - User's ID (for context in prompt)
 * @param {object} platformStats - Combined stats from all platforms
 * @returns {Promise<object>} { weakTopics, strengths, insights }
 */
const generateWeakTopicAnalysis = async (userId, platformStats) => {
  const aiModel = getModel();
  if (!aiModel) {
    return getFallbackWeakTopics();
  }

  try {
    const lcStats = platformStats.leetcode || {};
    const cfStats = platformStats.codeforces || {};
    const gfgStats = platformStats.gfg || {};

    const prompt = `You are an expert competitive programming coach. Analyze the following user stats and identify weak topics.

USER STATS:
LeetCode:
- Total Solved: ${lcStats.totalSolved || 0}
- Easy: ${lcStats.easySolved || 0}, Medium: ${lcStats.mediumSolved || 0}, Hard: ${lcStats.hardSolved || 0}
- Contest Rating: ${lcStats.contestRating || 0}
- Acceptance Rate: ${lcStats.acceptanceRate || 0}%

Codeforces:
- Rating: ${cfStats.rating || 0} (${cfStats.rank || 'unrated'})
- Max Rating: ${cfStats.maxRating || 0}
- Recent problems solved: ${(cfStats.recentProblems || []).map(p => p.name).join(', ') || 'None'}
- Tags seen: ${[...new Set((cfStats.recentProblems || []).flatMap(p => p.tags || []))].join(', ') || 'None'}

GFG:
- Total Solved: ${gfgStats.totalSolved || 0}
- Easy: ${gfgStats.easy || 0}, Medium: ${gfgStats.medium || 0}, Hard: ${gfgStats.hard || 0}

Respond with a JSON object ONLY (no markdown):
{
  "weakTopics": [
    { "topic": "Dynamic Programming", "reason": "Very few medium/hard DP problems solved", "priority": "high" },
    { "topic": "Graph Algorithms", "reason": "Missing BFS/DFS practice", "priority": "medium" }
  ],
  "strengths": ["Arrays", "Two Pointers", "Binary Search"],
  "insights": [
    "Your easy to medium ratio suggests you need to challenge yourself more",
    "Codeforces rating suggests focus on constructive algorithms"
  ],
  "overallLevel": "intermediate"
}`;

    const result = await aiModel.generateContent(prompt);
    const responseText = result.response.text();
    return parseGeminiJSON(responseText);
  } catch (error) {
    console.error('Gemini weak topic analysis error:', error.message);
    return getFallbackWeakTopics();
  }
};

/**
 * Generate a personalized weekly study roadmap based on weak topics.
 * @param {string} userId - User ID
 * @param {Array} weakTopics - Array of weak topic objects
 * @returns {Promise<object>} { weeks[], totalWeeks, description }
 */
const generatePersonalizedRoadmap = async (userId, weakTopics) => {
  const aiModel = getModel();
  if (!aiModel) {
    return getFallbackRoadmap();
  }

  try {
    const topicsStr = weakTopics
      .map((t) => `${t.topic} (Priority: ${t.priority})`)
      .join('\n');

    const prompt = `You are an expert competitive programming coach. Create a 12-week personalized study roadmap.

WEAK TOPICS TO ADDRESS:
${topicsStr}

Create a detailed 12-week roadmap. For each week, suggest 3-5 practice problems.
Respond with a JSON object ONLY (no markdown):
{
  "title": "Personalized CP Mastery Roadmap",
  "description": "A 12-week roadmap targeting your specific weak areas...",
  "totalWeeks": 12,
  "weeks": [
    {
      "weekNumber": 1,
      "topic": "Dynamic Programming Fundamentals",
      "description": "Master the basics of DP with classic problems",
      "problems": [
        { "name": "Climbing Stairs", "url": "https://leetcode.com/problems/climbing-stairs/", "difficulty": "easy", "platform": "leetcode" },
        { "name": "House Robber", "url": "https://leetcode.com/problems/house-robber/", "difficulty": "medium", "platform": "leetcode" },
        { "name": "Coin Change", "url": "https://leetcode.com/problems/coin-change/", "difficulty": "medium", "platform": "leetcode" },
        { "name": "Longest Increasing Subsequence", "url": "https://leetcode.com/problems/longest-increasing-subsequence/", "difficulty": "medium", "platform": "leetcode" },
        { "name": "Edit Distance", "url": "https://leetcode.com/problems/edit-distance/", "difficulty": "hard", "platform": "leetcode" }
      ],
      "isCompleted": false
    }
  ]
}`;

    const result = await aiModel.generateContent(prompt);
    return parseGeminiJSON(result.response.text());
  } catch (error) {
    console.error('Gemini roadmap generation error:', error.message);
    return getFallbackRoadmap();
  }
};

/**
 * Generate a weekly performance review report.
 * @param {string} userId - User ID
 * @param {object} weekStats - Stats for the past week
 * @returns {Promise<object>} { strengths, weaknesses, progress, recommendations }
 */
const generateWeeklyReport = async (userId, weekStats) => {
  const aiModel = getModel();
  if (!aiModel) {
    return getFallbackWeeklyReport();
  }

  try {
    const prompt = `You are an expert competitive programming coach. Analyze this week's performance and provide a report.

WEEKLY STATS:
- Problems solved this week: ${weekStats.problemsSolved || 0}
- Contest participated: ${weekStats.contestParticipated ? 'Yes' : 'No'}
- Rating change: ${weekStats.ratingChange || 0}
- Streak: ${weekStats.streak || 0} days
- Topics practiced: ${(weekStats.topics || []).join(', ') || 'None tracked'}
- LeetCode submissions: ${weekStats.lcSubmissions || 0}
- Codeforces submissions: ${weekStats.cfSubmissions || 0}

Respond with JSON ONLY (no markdown):
{
  "strengths": ["Consistent daily practice", "Improved DP skills"],
  "weaknesses": ["Low contest participation", "Avoiding hard problems"],
  "progress": "You solved 15% more problems than last week. Good momentum!",
  "recommendations": [
    "Attempt at least one contest this week",
    "Focus on graph problems for 2-3 sessions",
    "Try one hard LeetCode problem per day"
  ],
  "motivationalMessage": "Keep going! You're building great habits.",
  "weeklyScore": 72
}`;

    const result = await aiModel.generateContent(prompt);
    return parseGeminiJSON(result.response.text());
  } catch (error) {
    console.error('Gemini weekly report error:', error.message);
    return getFallbackWeeklyReport();
  }
};

/**
 * Generate a contest rating prediction.
 * @param {string} userId - User ID
 * @param {Array} contestHistory - User's contest history
 * @returns {Promise<object>} { expectedRatingChange, probability, tips }
 */
const generateContestPrediction = async (userId, contestHistory) => {
  const aiModel = getModel();
  if (!aiModel) {
    return getFallbackContestPrediction();
  }

  try {
    const last5 = contestHistory.slice(0, 5);
    const historyStr = last5
      .map(
        (c) =>
          `${c.contestName}: Rank ${c.rank}, Rating change: ${c.ratingChange > 0 ? '+' : ''}${c.ratingChange}`
      )
      .join('\n');

    const currentRating = last5.length > 0 ? last5[0].newRating : 0;

    const prompt = `You are a competitive programming analytics expert. Predict the user's performance in their next contest.

CONTEST HISTORY (most recent first):
${historyStr || 'No contest history available'}
Current Rating: ${currentRating}

Respond with JSON ONLY (no markdown):
{
  "expectedRatingChange": 45,
  "probability": {
    "ratingGain": 65,
    "ratingLoss": 35
  },
  "tips": [
    "Focus on implementation speed for the first 2 problems",
    "Practice greedy algorithms before the next contest",
    "Your recent upward trend suggests good momentum"
  ],
  "predictedRank": "Top 30%",
  "analysis": "Based on your last 5 contests, you have a consistent improvement trend..."
}`;

    const result = await aiModel.generateContent(prompt);
    return parseGeminiJSON(result.response.text());
  } catch (error) {
    console.error('Gemini contest prediction error:', error.message);
    return getFallbackContestPrediction();
  }
};

// Fallback responses when Gemini API is unavailable
const getFallbackWeakTopics = () => ({
  weakTopics: [
    { topic: 'Dynamic Programming', reason: 'Complex optimization problems require more practice', priority: 'high' },
    { topic: 'Graph Algorithms', reason: 'BFS/DFS and shortest path algorithms need attention', priority: 'high' },
    { topic: 'Segment Trees', reason: 'Advanced data structures for range queries', priority: 'medium' },
  ],
  strengths: ['Arrays', 'Strings', 'Binary Search'],
  insights: [
    'Connect your LeetCode and Codeforces accounts for more accurate analysis',
    'Solve more medium problems to improve your weak area proficiency',
  ],
  overallLevel: 'intermediate',
  _isFallback: true,
});

const getFallbackRoadmap = () => ({
  title: 'Standard CP Mastery Roadmap',
  description: 'A structured 12-week roadmap to improve your competitive programming skills.',
  totalWeeks: 12,
  weeks: [
    {
      weekNumber: 1,
      topic: 'Arrays & Two Pointers',
      description: 'Master array manipulation and the two-pointer technique.',
      problems: [
        { name: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'easy', platform: 'leetcode' },
        { name: 'Container With Most Water', url: 'https://leetcode.com/problems/container-with-most-water/', difficulty: 'medium', platform: 'leetcode' },
        { name: '3Sum', url: 'https://leetcode.com/problems/3sum/', difficulty: 'medium', platform: 'leetcode' },
      ],
      isCompleted: false,
    },
    {
      weekNumber: 2,
      topic: 'Binary Search',
      description: 'Learn binary search patterns and its applications.',
      problems: [
        { name: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/', difficulty: 'easy', platform: 'leetcode' },
        { name: 'Search in Rotated Sorted Array', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', difficulty: 'medium', platform: 'leetcode' },
        { name: 'Find Minimum in Rotated Sorted Array', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', difficulty: 'medium', platform: 'leetcode' },
      ],
      isCompleted: false,
    },
  ],
  _isFallback: true,
});

const getFallbackWeeklyReport = () => ({
  strengths: ['Regular practice', 'Problem variety'],
  weaknesses: ['Need more contest participation'],
  progress: 'Keep solving problems consistently to see your ratings improve.',
  recommendations: [
    'Participate in at least one weekly contest',
    'Review solutions for problems you found difficult',
    'Focus on one topic per week for depth',
  ],
  motivationalMessage: 'Every problem you solve makes you stronger. Keep going!',
  weeklyScore: 65,
  _isFallback: true,
});

const getFallbackContestPrediction = () => ({
  expectedRatingChange: 0,
  probability: { ratingGain: 50, ratingLoss: 50 },
  tips: [
    'Practice time management during contests',
    'Read all problems before starting to solve',
    'Focus on your strengths in the first hour',
  ],
  predictedRank: 'Depends on preparation',
  analysis: 'Connect your Codeforces account to get accurate contest predictions.',
  _isFallback: true,
});

module.exports = {
  generateWeakTopicAnalysis,
  generatePersonalizedRoadmap,
  generateWeeklyReport,
  generateContestPrediction,
};
