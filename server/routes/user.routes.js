const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  searchUsers,
  getPublicProfile,
} = require('../controllers/user.controller');

const { verifyJWT } = require('../middlewares/auth.middleware');
const { uploadAvatar: multerUpload, handleMulterError } = require('../middlewares/upload.middleware');
const { updateProfileValidator } = require('../validators/profile.validator');

// Public route - no auth needed
router.get('/public/:username', getPublicProfile);

// All routes below require authentication
router.use(verifyJWT);

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidator, updateProfile);
router.post('/avatar', multerUpload, handleMulterError, uploadAvatar);
router.delete('/account', deleteAccount);
router.get('/search', searchUsers);

module.exports = router;
