const express = require('express');
const {
    createCheckoutSession,
    createPaymentIntent,
    confirmPayment,
    getCreditPackages,
    handleWebhook,
    handleCheckoutSuccess
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// @route   GET /api/payments/packages
// @desc    Get available credit packages
// @access  Private
router.get('/packages', protect, getCreditPackages);

// @route   POST /api/payments/create-checkout-session
// @desc    Create a Stripe Checkout session for purchasing credits
// @access  Private
router.post('/create-checkout-session', [
    protect,
    body('credits')
        .isInt({ min: 1, max: 1000 })
        .withMessage('Credits must be between 1 and 1000')
], createCheckoutSession);

// @route   POST /api/payments/checkout-success
// @desc    Handle successful checkout and add credits to user account
// @access  Private
router.post('/checkout-success', [
    protect,
    body('sessionId')
        .notEmpty()
        .withMessage('Session ID is required')
], handleCheckoutSuccess);

// @route   POST /api/payments/create-payment-intent
// @desc    Create a payment intent for purchasing credits
// @access  Private
router.post('/create-payment-intent', [
    protect,
    body('credits')
        .isInt({ min: 1, max: 1000 })
        .withMessage('Credits must be between 1 and 1000')
], createPaymentIntent);

// @route   POST /api/payments/confirm-payment
// @desc    Confirm payment and add credits to user account
// @access  Private
router.post('/confirm-payment', [
    protect,
    body('paymentIntentId')
        .notEmpty()
        .withMessage('Payment Intent ID is required')
], confirmPayment);

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhooks
// @access  Public (secured with webhook signature)
// Note: This route needs to be handled before express.json() middleware
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;