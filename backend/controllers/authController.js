const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register user (send OTP)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user && user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Check if this is a developer account
        const developerEmails = ['yakshthakar24@gmail.com', 'harshilv3034@gmail.com'];
        const isDeveloper = developerEmails.includes(email.toLowerCase());
        
        // If user exists but not verified, update their info
        if (user && !user.isVerified) {
            user.name = name;
            user.password = password;
            user.flashcardCredits = isDeveloper ? 999999 : 5;
            user.isDeveloper = isDeveloper;
            user.hasUnlimitedCredits = isDeveloper;
        } else {
            // Create new user
            user = await User.create({
                name,
                email,
                password,
                flashcardCredits: isDeveloper ? 999999 : 5,
                isDeveloper: isDeveloper,
                hasUnlimitedCredits: isDeveloper,
                isVerified: false
            });
        }

        // Generate and send OTP
        const otp = user.generateOTP();
        await user.save();
        
        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, name, false);
        if (!emailResult.success) {
            console.error('Failed to send OTP email:', emailResult.error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Verification code sent to your email. Please check your inbox.',
            data: {
                email: user.email,
                otpSent: true
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Login user (send OTP)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Check if user exists and get password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email first. Check your inbox for the verification code.'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate and send OTP for login verification
        const otp = user.generateOTP();
        await user.save();
        
        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, user.name, true);
        if (!emailResult.success) {
            console.error('Failed to send login OTP email:', emailResult.error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Verification code sent to your email. Please check your inbox to complete login.',
            data: {
                email: user.email,
                otpSent: true
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    flashcardCredits: user.flashcardCredits,
                    subscriptionStatus: user.subscriptionStatus,
                    totalFlashcardsGenerated: user.totalFlashcardsGenerated,
                    createdAt: user.createdAt,
                    isDeveloper: user.isDeveloper,
                    hasUnlimitedCredits: user.hasUnlimitedCredits
                }
            }
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Verify OTP and complete registration/login
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, otp, isLogin = false } = req.body;

        // Find user with OTP details
        const user = await User.findOne({ email }).select('+otp +otpExpiry');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify OTP
        if (!user.verifyOTP(otp)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code'
            });
        }

        // Clear OTP and mark as verified
        user.clearOTP();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Send welcome email for new registrations
        if (!isLogin) {
            const welcomeEmailResult = await sendWelcomeEmail(user.email, user.name);
            if (!welcomeEmailResult.success) {
                console.error('Failed to send welcome email:', welcomeEmailResult.error);
            }
        }

        res.status(200).json({
            success: true,
            message: isLogin ? 'Login successful' : 'Account verified successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    flashcardCredits: user.flashcardCredits,
                    subscriptionStatus: user.subscriptionStatus,
                    totalFlashcardsGenerated: user.totalFlashcardsGenerated,
                    isDeveloper: user.isDeveloper,
                    hasUnlimitedCredits: user.hasUnlimitedCredits,
                    isVerified: user.isVerified
                }
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during verification',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, isLogin = false } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // For login OTP resend, check if user is verified
        if (isLogin && !user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Please complete account verification first'
            });
        }

        // Generate new OTP
        const otp = user.generateOTP();
        await user.save();
        
        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, user.name, isLogin);
        if (!emailResult.success) {
            console.error('Failed to resend OTP email:', emailResult.error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'New verification code sent to your email',
            data: {
                email: user.email,
                otpSent: true
            }
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP resend',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
    verifyOTP,
    resendOTP
};
