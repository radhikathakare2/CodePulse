const { ApiError } = require('../utils/apiResponse');

/**
 * Middleware: Require premium subscription.
 * Must be used AFTER verifyJWT.
 */
const requirePremium = (req, _res, next) => {
  const user = req.user;

  if (!user) {
    return next(new ApiError(401, 'Authentication required.'));
  }

  // Check premium status and expiry
  if (!user.isPremium) {
    return next(
      new ApiError(
        403,
        'This feature requires a Premium subscription. Upgrade to unlock AI insights, roadmaps, and more.'
      )
    );
  }

  // Check if premium has expired
  if (user.premiumExpiresAt && new Date() > new Date(user.premiumExpiresAt)) {
    return next(
      new ApiError(
        403,
        'Your Premium subscription has expired. Please renew to continue using this feature.'
      )
    );
  }

  next();
};

module.exports = { requirePremium };
