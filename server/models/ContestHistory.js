const mongoose = require('mongoose');

const contestHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    platform: {
      type: String,
      enum: ['leetcode', 'codeforces', 'codechef', 'gfg'],
      required: true,
    },
    contestId: {
      type: String,
      required: true,
    },
    contestName: {
      type: String,
      required: true,
    },
    rank: {
      type: Number,
      default: 0,
    },
    oldRating: {
      type: Number,
      default: 0,
    },
    newRating: {
      type: Number,
      default: 0,
    },
    ratingChange: {
      type: Number,
      default: 0,
    },
    problemsSolved: {
      type: Number,
      default: 0,
    },
    totalProblems: {
      type: Number,
      default: 0,
    },
    contestDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

contestHistorySchema.index({ userId: 1, platform: 1 });
contestHistorySchema.index({ userId: 1, contestDate: -1 });
contestHistorySchema.index({ userId: 1, contestId: 1, platform: 1 }, { unique: true });

const ContestHistory = mongoose.model('ContestHistory', contestHistorySchema);
module.exports = ContestHistory;
