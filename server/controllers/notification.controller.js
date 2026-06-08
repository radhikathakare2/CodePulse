const { ApiResponse, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../services/notification.service');

/**
 * GET /api/v1/notifications
 * Get paginated notifications for the current user.
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const result = await getUserNotifications(
    req.user._id,
    parseInt(page),
    parseInt(limit)
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications: result.notifications,
        total: result.total,
        unreadCount: result.unreadCount,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      'Notifications fetched.'
    )
  );
});

/**
 * PUT /api/v1/notifications/:id/read
 * Mark a specific notification as read.
 */
const markRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await markAsRead(id, req.user._id);

  return res.status(200).json(
    new ApiResponse(200, { notification }, 'Notification marked as read.')
  );
});

/**
 * PUT /api/v1/notifications/read-all
 * Mark all notifications for the user as read.
 */
const markAllRead = asyncHandler(async (req, res) => {
  const count = await markAllAsRead(req.user._id);

  return res.status(200).json(
    new ApiResponse(200, { updatedCount: count }, 'All notifications marked as read.')
  );
});

/**
 * DELETE /api/v1/notifications/:id
 * Delete a specific notification.
 */
const removeNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await deleteNotification(id, req.user._id);

  return res.status(200).json(
    new ApiResponse(200, {}, 'Notification deleted.')
  );
});

module.exports = { getNotifications, markRead, markAllRead, removeNotification };
