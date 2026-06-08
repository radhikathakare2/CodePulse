const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {
  PLANS,
  createOrder,
  verifyPaymentSignature,
  calculateExpiryDate,
} = require('../services/razorpay.service');
const { createNotification } = require('../services/notification.service');

/**
 * POST /api/v1/subscriptions/create-order
 * Create a Razorpay order for a premium plan.
 */
const createSubscriptionOrder = asyncHandler(async (req, res) => {
  const { plan } = req.body;

  if (!plan || !PLANS[plan]) {
    throw new ApiError(400, `Invalid plan. Choose from: ${Object.keys(PLANS).join(', ')}`);
  }

  const planDetails = PLANS[plan];
  const receipt = `codepulse_${req.user._id}_${Date.now()}`;

  const order = await createOrder(planDetails.amount, planDetails.currency, receipt, {
    userId: req.user._id.toString(),
    plan,
    userEmail: req.user.email,
  });

  // Create a pending subscription record
  const expiryDate = calculateExpiryDate(plan);
  const subscription = await Subscription.create({
    userId: req.user._id,
    plan,
    amount: planDetails.amount,
    currency: planDetails.currency,
    razorpayOrderId: order.id,
    status: 'created',
    startDate: new Date(),
    endDate: expiryDate,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        planName: planDetails.name,
        subscriptionId: subscription._id,
      },
      'Order created. Complete payment to activate premium.'
    )
  );
});

/**
 * POST /api/v1/subscriptions/verify
 * Verify Razorpay payment signature and activate premium.
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'Missing payment verification fields.');
  }

  // Verify signature
  const isValid = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    // Mark subscription as failed
    await Subscription.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed' }
    );
    throw new ApiError(400, 'Payment verification failed. Invalid signature.');
  }

  // Find and update subscription
  const subscription = await Subscription.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id, userId: req.user._id },
    {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'paid',
    },
    { new: true }
  );

  if (!subscription) {
    throw new ApiError(404, 'Subscription record not found.');
  }

  // Activate premium on User
  await User.findByIdAndUpdate(req.user._id, {
    isPremium: true,
    premiumPlan: subscription.plan,
    premiumExpiresAt: subscription.endDate,
  });

  // Send notification
  await createNotification(
    req.user._id,
    'subscription',
    '🎉 Premium Activated!',
    `Your CodePulse ${subscription.plan} plan is now active until ${new Date(subscription.endDate).toLocaleDateString()}.`,
    { plan: subscription.plan, expiresAt: subscription.endDate }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { subscription, isPremium: true, expiresAt: subscription.endDate },
      `Premium ${subscription.plan} plan activated successfully!`
    )
  );
});

/**
 * GET /api/v1/subscriptions/status
 * Get the current subscription status for the authenticated user.
 */
const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const user = req.user;

  const latestSubscription = await Subscription.findOne({
    userId: user._id,
    status: 'paid',
  }).sort({ createdAt: -1 });

  const isExpired =
    user.isPremium &&
    user.premiumExpiresAt &&
    new Date() > new Date(user.premiumExpiresAt);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isPremium: user.isPremium && !isExpired,
        plan: user.premiumPlan,
        expiresAt: user.premiumExpiresAt,
        isExpired,
        latestSubscription,
      },
      'Subscription status fetched.'
    )
  );
});

/**
 * PUT /api/v1/subscriptions/cancel (admin only via admin routes)
 * Cancel a subscription and revoke premium.
 */
const cancelSubscription = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const subscription = await Subscription.findOneAndUpdate(
    { userId, status: 'paid' },
    { status: 'refunded' },
    { new: true }
  );

  if (!subscription) {
    throw new ApiError(404, 'No active subscription found for this user.');
  }

  await User.findByIdAndUpdate(userId, {
    isPremium: false,
    premiumPlan: null,
    premiumExpiresAt: null,
  });

  await createNotification(
    userId,
    'subscription',
    '⚠️ Subscription Cancelled',
    'Your CodePulse Premium subscription has been cancelled by the admin.',
    {}
  );

  return res.status(200).json(
    new ApiResponse(200, { subscription }, 'Subscription cancelled and premium revoked.')
  );
});

module.exports = {
  createSubscriptionOrder,
  verifyPayment,
  getSubscriptionStatus,
  cancelSubscription,
};
