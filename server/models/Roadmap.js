const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, default: '' },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'medium',
    },
    platform: {
      type: String,
      enum: ['leetcode', 'codeforces', 'gfg', 'other'],
      default: 'leetcode',
    },
  },
  { _id: false }
);

const weekSchema = new mongoose.Schema(
  {
    weekNumber: { type: Number, required: true },
    topic: { type: String, required: true },
    description: { type: String, default: '' },
    problems: [problemSchema],
    isCompleted: { type: Boolean, default: false },
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    weeks: [weekSchema],
    totalWeeks: {
      type: Number,
      default: 0,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

roadmapSchema.index({ userId: 1 });

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
module.exports = Roadmap;
