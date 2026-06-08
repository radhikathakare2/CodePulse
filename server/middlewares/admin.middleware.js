const { ApiError } = require('../utils/apiResponse');

/**
 * Middleware: Require admin role.
 * Must be used AFTER verifyJWT.
 */
const requireAdmin = (req, _res, next) => {
  const user = req.user;

  if (!user) {
    return next(new ApiError(401, 'Authentication required.'));
  }

  if (user.role !== 'admin') {
    return next(
      new ApiError(403, 'Access denied. Admin privileges required for this action.')
    );
  }

  next();
};

module.exports = { requireAdmin };
