const express = require('express');
const router = express.Router();

const {
  syncLeetCode,
  syncCodeforces,
  syncGFG,
  getAllStats,
  getContributionCalendar,
} = require('../controllers/platform.controller');

const { verifyJWT } = require('../middlewares/auth.middleware');

// All platform routes require authentication
router.use(verifyJWT);

router.post('/sync/leetcode', syncLeetCode);
router.post('/sync/codeforces', syncCodeforces);
router.post('/sync/gfg', syncGFG);
router.get('/stats', getAllStats);
router.get('/calendar', getContributionCalendar);

module.exports = router;
