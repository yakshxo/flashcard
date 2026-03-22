const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password } = req.body;

        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const developerEmails = ['yakshthakar24@gmail.com', 'harshilv3034@gmail.com'];
        const isDeveloper = developerEmails.includes(email.toLowerCase());

        user = await User.create({
            name,
            email,
            password,
            flashcardCredits: isDeveloper ? 999999 : 5,
            isDeveloper: isDeveloper,
            hasUnlimitedCredits: isDeveloper,
            isVerified: true
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
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
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // In case old accounts were created before verification was removed
        if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
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

// Disabled OTP endpoints
const verifyOTP = async (req, res) => {
    return res.status(410).json({
        success: false,
        message: 'OTP verification has been disabled'
    });
};

const resendOTP = async (req, res) => {
    return res.status(410).json({
        success: false,
        message: 'OTP resend has been disabled'
    });
};

module.exports = {
    register,
    login,
    getMe,
    verifyOTP,
    resendOTP
};