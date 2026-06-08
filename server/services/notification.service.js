const Notification = require('../models/Notification');
const { ApiError } = require('../utils/apiResponse');

/**
 * Create a new notification for a user.
 * @param {string} userId - Recipient user ID
 * @param {string} type - Notification type
 * @param {string} title - Short notification title
 * @param {string} message - Notification body
 * @param {object} data - Optional extra metadata (links, IDs, etc.)
 * @returns {Promise<object>} Created notification document
 */
const createNotification = async (userId, type, title, message, data = {}) => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    data,
    isRead: false,
  });
  return notification;
};

/**
 * Mark a specific notification as read.
 * @param {string} notificationId - Notification document ID
 * @param {string} userId - The user who owns the notification (security check)
 * @returns {Promise<object>} Updated notification
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    throw new ApiError(404, 'Notification not found.');
  }
  return notification;
};

/**
 * Get paginated notifications for a user.
 * @param {string} userId
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Promise<{ notifications: Array, total: number, unreadCount: number }>}
 */
const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId }),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  return { notifications, total, unreadCount };
};

/**
 * Mark all notifications for a user as read.
 * @param {string} userId
 * @returns {Promise<number>} Count of updated documents
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
  return result.modifiedCount;
};

/**
 * Delete a notification (user must own it).
 * @param {string} notificationId
 * @param {string} userId
 */
const deleteNotification = async (notificationId, userId) => {
  const result = await Notification.deleteOne({ _id: notificationId, userId });
  if (result.deletedCount === 0) {
    throw new ApiError(404, 'Notification not found.');
  }
};

module.exports = {
  createNotification,
  markAsRead,
  getUserNotifications,
  markAllAsRead,
  deleteNotification,
};
