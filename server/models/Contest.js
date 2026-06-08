const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ['leetcode', 'codeforces', 'codechef'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // duration in minutes
      required: true,
    },
    url: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      default: 'mixed',
    },
    isVirtual: {
      type: Boolean,
      default: false,
    },
    registeredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    reminders: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reminderTime: {
          type: Date,
        },
      },
    ],
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// TTL index: remove contests 6 hours after they were fetched
contestSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 21600 });
contestSchema.index({ startTime: 1 });
contestSchema.index({ platform: 1 });

const Contest = mongoose.model('Contest', contestSchema);
module.exports = Contest;
