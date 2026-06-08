const mongoose = require('mongoose');

const recentSubmissionSchema = new mongoose.Schema(
  {
    title: String,
    titleSlug: String,
    timestamp: String,
    status: String,
    lang: String,
  },
  { _id: false }
);

const contestHistoryItemSchema = new mongoose.Schema(
  {
    contestId: Number,
    contestName: String,
    rank: Number,
    oldRating: Number,
    newRating: Number,
    ratingChange: Number,
    time: Number,
  },
  { _id: false }
);

const recentProblemSchema = new mongoose.Schema(
  {
    name: String,
    tags: [String],
    rating: Number,
    verdict: String,
  },
  { _id: false }
);

const platformStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    platform: {
      type: String,
      enum: ['leetcode', 'codeforces', 'gfg'],
      required: true,
    },
    // LeetCode specific fields
    leetcode: {
      totalSolved: { type: Number, default: 0 },
      easySolved: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 },
      ranking: { type: Number, default: 0 },
      contestRating: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      submissionCalendar: {
        type: Map,
        of: Number,
        default: {},
      },
      recentSubmissions: [recentSubmissionSchema],
    },
    // Codeforces specific fields
    codeforces: {
      handle: { type: String, default: '' },
      rating: { type: Number, default: 0 },
      rank: { type: String, default: '' },
      maxRating: { type: Number, default: 0 },
      maxRank: { type: String, default: '' },
      contribution: { type: Number, default: 0 },
      friendOfCount: { type: Number, default: 0 },
      contestHistory: [contestHistoryItemSchema],
      recentProblems: [recentProblemSchema],
    },
    // GFG specific fields
    gfg: {
      username: { type: String, default: '' },
      totalSolved: { type: Number, default: 0 },
      codingScore: { type: Number, default: 0 },
      institutionRank: { type: String, default: '' },
      school: { type: Number, default: 0 },
      basic: { type: Number, default: 0 },
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for fast lookups
platformStatsSchema.index({ userId: 1, platform: 1 }, { unique: true });

// TTL index: auto-expire cache after 15 minutes (900 seconds)
platformStatsSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 900 });

const PlatformStats = mongoose.model('PlatformStats', platformStatsSchema);
module.exports = PlatformStats;
