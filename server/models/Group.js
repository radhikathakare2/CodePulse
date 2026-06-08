const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [100, 'Group name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
    maxMembers: {
      type: Number,
      default: 50,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    inviteCode: {
      type: String,
      unique: true,
      default: () => Math.random().toString(36).substring(2, 10).toUpperCase(),
    },
    weeklyGoal: {
      type: Number,
      default: 5, // problems per week
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

groupSchema.index({ inviteCode: 1 }, { unique: true });
groupSchema.index({ creator: 1 });
groupSchema.index({ 'members.userId': 1 });
groupSchema.index({ isPublic: 1 });

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
