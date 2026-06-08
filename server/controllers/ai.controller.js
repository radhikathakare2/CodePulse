const PlatformStats = require('../models/PlatformStats');
const AIReport = require('../models/AIReport');
const Roadmap = require('../models/Roadmap');
const ContestHistory = require('../models/ContestHistory');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {
  generateWeakTopicAnalysis,
  generatePersonalizedRoadmap,
  generateWeeklyReport,
  generateContestPrediction,
} = require('../services/gemini.service');
const { createNotification } = require('../services/notification.service');

/**
 * GET /api/v1/ai/weak-topics
 * Premium only: Analyze weak topics using AI.
 */
const getWeakTopicAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Gather all platform stats
  const platformStats = await PlatformStats.find({ userId }).lean();
  const statsMap = {};
  platformStats.forEach((s) => {
    statsMap[s.platform] = s[s.platform];
  });

  const analysis = await generateWeakTopicAnalysis(userId, statsMap);

  // Save report
  const report = await AIReport.create({
    userId,
    reportType: 'weak_topics',
    content: analysis,
    generatedAt: new Date(),
  });

  // Send notification
  await createNotification(
    userId,
    'ai_report',
    '🤖 AI Analysis Ready',
    'Your personalized weak topic analysis is ready to view!',
    { reportId: report._id }
  );

  return res.status(200).json(
    new ApiResponse(200, { analysis, reportId: report._id }, 'Weak topic analysis generated.')
  );
});

/**
 * GET /api/v1/ai/roadmap
 * Premium only: Generate a personalized study roadmap.
 */
const getPersonalizedRoadmap = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Check for recent roadmap (generated within 24 hours)
  const recentRoadmap = await Roadmap.findOne({
    userId,
    generatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  }).lean();

  if (recentRoadmap) {
    return res.status(200).json(
      new ApiResponse(200, { roadmap: recentRoadmap, cached: true }, 'Roadmap fetched from cache.')
    );
  }

  // Get latest weak topic report
  const weakTopicReport = await AIReport.findOne({
    userId,
    reportType: 'weak_topics',
  }).sort({ generatedAt: -1 });

  const weakTopics = weakTopicReport?.content?.weakTopics || [
    { topic: 'Dynamic Programming', priority: 'high' },
    { topic: 'Graph Algorithms', priority: 'high' },
    { topic: 'Binary Search', priority: 'medium' },
  ];

  const roadmapData = await generatePersonalizedRoadmap(userId, weakTopics);

  // Save to DB
  const roadmap = await Roadmap.findOneAndUpdate(
    { userId },
    {
      userId,
      title: roadmapData.title || 'Personalized CP Roadmap',
      description: roadmapData.description || '',
      weeks: roadmapData.weeks || [],
      totalWeeks: roadmapData.totalWeeks || roadmapData.weeks?.length || 0,
      generatedAt: new Date(),
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );

  // Save AI report
  await AIReport.create({
    userId,
    reportType: 'roadmap',
    content: roadmapData,
    generatedAt: new Date(),
  });

  return res.status(200).json(
    new ApiResponse(200, { roadmap }, 'Personalized roadmap generated!')
  );
});

/**
 * GET /api/v1/ai/weekly-report
 * Premium only: Generate a weekly performance review.
 */
const getWeeklyReport = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Gather this week's stats approximation from platform data
  const platformStats = await PlatformStats.find({ userId }).lean();

  const weekStats = {
    problemsSolved: 0,
    streak: 0,
    contestParticipated: false,
    ratingChange: 0,
    topics: [],
    lcSubmissions: 0,
    cfSubmissions: 0,
  };

  platformStats.forEach((s) => {
    if (s.platform === 'leetcode') {
      weekStats.problemsSolved += s.leetcode?.totalSolved || 0;
      weekStats.streak = s.leetcode?.streak || 0;
      weekStats.lcSubmissions = s.leetcode?.recentSubmissions?.length || 0;
    }
    if (s.platform === 'codeforces') {
      weekStats.cfSubmissions = s.codeforces?.recentProblems?.length || 0;
      const recentContests = s.codeforces?.contestHistory?.slice(0, 3) || [];
      weekStats.contestParticipated = recentContests.length > 0;
      weekStats.ratingChange = recentContests.reduce(
        (sum, c) => sum + (c.ratingChange || 0),
        0
      );
      weekStats.topics = [
        ...new Set(
          s.codeforces?.recentProblems?.flatMap((p) => p.tags || []) || []
        ),
      ].slice(0, 5);
    }
  });

  const report = await generateWeeklyReport(userId, weekStats);

  // Save report
  const savedReport = await AIReport.create({
    userId,
    reportType: 'weekly_review',
    content: { ...report, weekStats },
    generatedAt: new Date(),
  });

  await createNotification(
    userId,
    'ai_report',
    '📊 Weekly Report Ready',
    'Your AI-generated weekly performance report is ready!',
    { reportId: savedReport._id }
  );

  return res.status(200).json(
    new ApiResponse(200, { report, reportId: savedReport._id }, 'Weekly report generated.')
  );
});

/**
 * GET /api/v1/ai/contest-prediction
 * Premium only: Predict next contest performance.
 */
const getContestPrediction = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const contestHistory = await ContestHistory.find({ userId })
    .sort({ contestDate: -1 })
    .limit(10)
    .lean();

  const prediction = await generateContestPrediction(userId, contestHistory);

  // Save report
  const savedReport = await AIReport.create({
    userId,
    reportType: 'contest_prediction',
    content: prediction,
    generatedAt: new Date(),
  });

  return res.status(200).json(
    new ApiResponse(200, { prediction, reportId: savedReport._id }, 'Contest prediction generated.')
  );
});

/**
 * GET /api/v1/ai/saved-roadmap
 * Get the user's saved roadmap.
 */
const getSavedRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne({ userId: req.user._id }).lean();

  if (!roadmap) {
    throw new ApiError(
      404,
      'No roadmap found. Generate one using the AI Roadmap feature.'
    );
  }

  return res.status(200).json(
    new ApiResponse(200, { roadmap }, 'Saved roadmap fetched.')
  );
});

/**
 * GET /api/v1/ai/saved-reports
 * Get user's saved AI reports (paginated).
 */
const getSavedReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { userId: req.user._id };
  if (type) filter.reportType = type;

  const [reports, total] = await Promise.all([
    AIReport.find(filter)
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    AIReport.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { reports, total, page: parseInt(page) }, 'Saved reports fetched.')
  );
});

module.exports = {
  getWeakTopicAnalysis,
  getPersonalizedRoadmap,
  getWeeklyReport,
  getContestPrediction,
  getSavedRoadmap,
  getSavedReports,
};
