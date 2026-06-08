const express = require('express');
const router = express.Router();

const {
  getWeakTopicAnalysis,
  getPersonalizedRoadmap,
  getWeeklyReport,
  getContestPrediction,
  getSavedRoadmap,
  getSavedReports,
} = require('../controllers/ai.controller');

const { verifyJWT } = require('../middlewares/auth.middleware');
const { requirePremium } = require('../middlewares/premium.middleware');

// All AI routes require authentication AND premium subscription
router.use(verifyJWT);
router.use(requirePremium);

router.get('/weak-topics', getWeakTopicAnalysis);
router.get('/roadmap', getPersonalizedRoadmap);
router.get('/weekly-report', getWeeklyReport);
router.get('/contest-prediction', getContestPrediction);
router.get('/saved-roadmap', getSavedRoadmap);
router.get('/saved-reports', getSavedReports);

module.exports = router;
