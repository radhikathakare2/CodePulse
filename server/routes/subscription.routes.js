const express = require('express');
const router = express.Router();

const {
  createSubscriptionOrder,
  verifyPayment,
  getSubscriptionStatus,
} = require('../controllers/subscription.controller');

const { verifyJWT } = require('../middlewares/auth.middleware');

// All subscription routes require authentication
router.use(verifyJWT);

router.post('/create-order', createSubscriptionOrder);
router.post('/verify', verifyPayment);
router.get('/status', getSubscriptionStatus);

module.exports = router;
