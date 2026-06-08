const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  banUser,
  unbanUser,
  getAllSubscriptions,
  getRevenueStats,
  manageContest,
} = require('../controllers/admin.controller');

const { verifyJWT } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');

// All admin routes require authentication AND admin role
router.use(verifyJWT);
router.use(requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/unban', unbanUser);
router.get('/subscriptions', getAllSubscriptions);
router.get('/revenue', getRevenueStats);
router.post('/contests', manageContest);

module.exports = router;
