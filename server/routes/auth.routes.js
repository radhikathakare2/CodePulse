const express = require('express');
const router = express.Router();

const {
  register,
  verifyEmail,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controllers/auth.controller');

const { verifyJWT } = require('../middlewares/auth.middleware');

const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require('../validators/auth.validator');

// Public routes
router.post('/register', registerValidator, register);
router.post('/verify-email', verifyEmail);
router.post('/login', loginValidator, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post('/reset-password', resetPasswordValidator, resetPassword);

// Protected routes
router.post('/logout', verifyJWT, logout);
router.put('/change-password', verifyJWT, changePasswordValidator, changePassword);

module.exports = router;
