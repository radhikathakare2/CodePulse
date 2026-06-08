const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    profilePhoto: {
      url: {
        type: String,
        default: '',
      },
      public_id: {
        type: String,
        default: '',
      },
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    college: {
      type: String,
      maxlength: [150, 'College name cannot exceed 150 characters'],
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
      match: [/^https?:\/\/(www\.)?github\.com\//, 'Please provide a valid GitHub URL'],
    },
    platformUsernames: {
      leetcode: { type: String, default: '' },
      codeforces: { type: String, default: '' },
      gfg: { type: String, default: '' },
    },
    currentRating: {
      type: Number,
      default: 0,
    },
    rank: {
      type: String,
      default: 'Newbie',
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumPlan: {
      type: String,
      enum: ['monthly', 'yearly', null],
      default: null,
    },
    premiumExpiresAt: {
      type: Date,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    achievementBadges: [
      {
        name: { type: String, required: true },
        description: { type: String, default: '' },
        earnedAt: { type: Date, default: Date.now },
        icon: { type: String, default: '🏆' },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isPremium: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if premium is still valid
userSchema.methods.checkPremiumStatus = function () {
  if (this.isPremium && this.premiumExpiresAt && new Date() > this.premiumExpiresAt) {
    this.isPremium = false;
    this.premiumPlan = null;
    this.save({ validateBeforeSave: false });
    return false;
  }
  return this.isPremium;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
