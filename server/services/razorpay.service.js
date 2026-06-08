const crypto = require('crypto');
const { getRazorpay } = require('../config/razorpay');

/**
 * Premium plan definitions with amounts in paise (INR).
 */
const PLANS = {
  monthly: {
    amount: 9900, // ₹99
    currency: 'INR',
    name: 'CodePulse Premium Monthly',
    durationDays: 30,
  },
  yearly: {
    amount: 79900, // ₹799
    currency: 'INR',
    name: 'CodePulse Premium Yearly',
    durationDays: 365,
  },
};

/**
 * Create a new Razorpay order.
 * @param {number} amount - Amount in paise
 * @param {string} currency - Currency code (default: 'INR')
 * @param {string} receipt - Unique receipt identifier
 * @param {object} notes - Optional metadata notes
 * @returns {Promise<object>} Razorpay order object
 */
const createOrder = async (amount, currency = 'INR', receipt, notes = {}) => {
  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt,
    notes,
    payment_capture: 1, // auto-capture
  });
  return order;
};

/**
 * Verify Razorpay payment signature using HMAC-SHA256.
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Signature from Razorpay webhook/callback
 * @returns {boolean} True if signature is valid
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error('RAZORPAY_KEY_SECRET is not set in environment variables');
  }

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

/**
 * Calculate premium expiry date based on plan.
 * @param {string} planKey - 'monthly' | 'yearly'
 * @returns {Date} Expiry date
 */
const calculateExpiryDate = (planKey) => {
  const plan = PLANS[planKey];
  if (!plan) throw new Error(`Unknown plan: ${planKey}`);
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + plan.durationDays);
  return expiry;
};

module.exports = { PLANS, createOrder, verifyPaymentSignature, calculateExpiryDate };
