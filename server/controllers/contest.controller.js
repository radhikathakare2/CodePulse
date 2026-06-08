const Contest = require('../models/Contest');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { fetchAndCacheContests } = require('../services/contest.service');
const { createNotification } = require('../services/notification.service');

/**
 * GET /api/v1/contests
 * Get all upcoming contests from all platforms.
 */
const getUpcomingContests = asyncHandler(async (req, res) => {
  const { platform } = req.query;

  const contests = await fetchAndCacheContests();

  let filtered = contests;
  if (platform) {
    filtered = contests.filter((c) => c.platform === platform);
  }

  return res.status(200).json(
    new ApiResponse(200, { contests: filtered, total: filtered.length }, 'Upcoming contests fetched.')
  );
});

/**
 * POST /api/v1/contests/:id/register
 * Register user interest in a contest.
 */
const registerInterest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const contest = await Contest.findById(id);
  if (!contest) {
    throw new ApiError(404, 'Contest not found.');
  }

  const alreadyRegistered = contest.registeredUsers.some(
    (uid) => uid.toString() === userId.toString()
  );

  if (alreadyRegistered) {
    // Toggle off
    contest.registeredUsers = contest.registeredUsers.filter(
      (uid) => uid.toString() !== userId.toString()
    );
    await contest.save();
    return res.status(200).json(
      new ApiResponse(200, { registered: false }, 'Removed from interested list.')
    );
  }

  contest.registeredUsers.push(userId);
  await contest.save();

  return res.status(200).json(
    new ApiResponse(200, { registered: true }, 'Registered interest in contest.')
  );
});

/**
 * POST /api/v1/contests/:id/reminder
 * Set a contest reminder (creates a notification at the reminder time).
 */
const setReminder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { minutesBefore = 30 } = req.body;
  const userId = req.user._id;

  const contest = await Contest.findById(id);
  if (!contest) {
    throw new ApiError(404, 'Contest not found.');
  }

  if (new Date() >= contest.startTime) {
    throw new ApiError(400, 'Cannot set a reminder for a contest that has already started.');
  }

  const reminderTime = new Date(
    contest.startTime.getTime() - minutesBefore * 60 * 1000
  );

  if (reminderTime <= new Date()) {
    throw new ApiError(400, 'Reminder time is in the past. Choose a larger lead time.');
  }

  // Remove existing reminder for this user+contest
  contest.reminders = contest.reminders.filter(
    (r) => r.userId.toString() !== userId.toString()
  );

  contest.reminders.push({ userId, reminderTime });
  await contest.save();

  // Create an immediate notification as confirmation
  await createNotification(
    userId,
    'contest_reminder',
    `🔔 Reminder Set: ${contest.name}`,
    `You'll be reminded ${minutesBefore} minutes before ${contest.name} starts on ${new Date(contest.startTime).toLocaleString()}.`,
    { contestId: contest._id, platform: contest.platform, startTime: contest.startTime }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { reminderTime },
      `Reminder set for ${minutesBefore} minutes before the contest.`
    )
  );
});

/**
 * GET /api/v1/contests/:id/calendar
 * Generate a Google Calendar add link for a contest.
 */
const addToCalendar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const contest = await Contest.findById(id);
  if (!contest) {
    throw new ApiError(404, 'Contest not found.');
  }

  // Format for Google Calendar
  const formatDate = (date) =>
    date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');

  const startFormatted = formatDate(contest.startTime);
  const endFormatted = formatDate(contest.endTime);

  const calendarUrl = new URL('https://www.google.com/calendar/render');
  calendarUrl.searchParams.set('action', 'TEMPLATE');
  calendarUrl.searchParams.set('text', `${contest.name} [${contest.platform.toUpperCase()}]`);
  calendarUrl.searchParams.set('dates', `${startFormatted}/${endFormatted}`);
  calendarUrl.searchParams.set(
    'details',
    `${contest.platform.toUpperCase()} contest. Join at: ${contest.url}`
  );
  calendarUrl.searchParams.set('location', contest.url);

  return res.status(200).json(
    new ApiResponse(200, { calendarUrl: calendarUrl.toString() }, 'Google Calendar link generated.')
  );
});

module.exports = { getUpcomingContests, registerInterest, setReminder, addToCalendar };
