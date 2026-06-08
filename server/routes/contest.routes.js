const express = require('express');
const router = express.Router();

const {
  getUpcomingContests,
  registerInterest,
  setReminder,
  addToCalendar,
} = require('../controllers/contest.controller');

const { verifyJWT } = require('../middlewares/auth.middleware');

// All contest routes require authentication
router.use(verifyJWT);

router.get('/', getUpcomingContests);
router.post('/:id/register', registerInterest);
router.post('/:id/reminder', setReminder);
router.get('/:id/calendar', addToCalendar);

module.exports = router;
