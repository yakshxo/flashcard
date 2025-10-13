const express = require('express');
const { register, login, getMe, verifyOTP, resendOTP } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin, validateOTP, validateEmail } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, login);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, getMe);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and complete registration/login
// @access  Public
router.post('/verify-otp', validateOTP, verifyOTP);

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP
// @access  Public
router.post('/resend-otp', validateEmail, resendOTP);

module.exports = router;
