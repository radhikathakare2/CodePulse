const express = require('express');
const router = express.Router();

const {
  getNotifications,
  markRead,
  markAllRead,
  removeNotification,
} = require('../controllers/notification.controller');

const { verifyJWT } = require('../middlewares/auth.middleware');

// All notification routes require authentication
router.use(verifyJWT);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);
router.delete('/:id', removeNotification);

module.exports = router;
