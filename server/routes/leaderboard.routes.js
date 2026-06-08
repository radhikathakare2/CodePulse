const express = require('express');
const router = express.Router();

const {
  getGlobalLeaderboard,
  getFriendLeaderboard,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
} = require('../controllers/leaderboard.controller');

const { verifyJWT } = require('../middlewares/auth.middleware');

// All leaderboard routes require authentication
router.use(verifyJWT);

router.get('/global', getGlobalLeaderboard);
router.get('/friends', getFriendLeaderboard);
router.get('/weekly', getWeeklyLeaderboard);
router.get('/monthly', getMonthlyLeaderboard);

module.exports = router;
