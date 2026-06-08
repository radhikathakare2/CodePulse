const mongoose = require('mongoose');

const aiReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportType: {
      type: String,
      enum: ['weekly_review', 'weak_topics', 'roadmap', 'contest_prediction'],
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

aiReportSchema.index({ userId: 1, reportType: 1 });
aiReportSchema.index({ userId: 1, generatedAt: -1 });

const AIReport = mongoose.model('AIReport', aiReportSchema);
module.exports = AIReport;
