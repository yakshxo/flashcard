const express = require('express');
const {
    getProfile,
    updateProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    requestEmailChange,
    confirmEmailChange
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { uploadProfilePicture: uploadMiddleware, handleUploadError } = require('../middleware/upload');
const { body } = require('express-validator');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', getProfile);

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', [
    body('schoolName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('School name cannot exceed 100 characters'),
    body('phoneNumber')
        .optional()
        .trim()
        .isMobilePhone()
        .withMessage('Please enter a valid phone number')
], updateProfile);

// @route   POST /api/profile/upload-picture
// @desc    Upload profile picture
// @access  Private
router.post('/upload-picture', (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
        if (err) {
            return handleUploadError(err, req, res, next);
        }
        next();
    });
}, uploadProfilePicture);

// @route   DELETE /api/profile/picture
// @desc    Delete profile picture
// @access  Private
router.delete('/picture', deleteProfilePicture);

// @route   POST /api/profile/request-email-change
// @desc    Request email change (send OTP)
// @access  Private
router.post('/request-email-change', [
    body('newEmail')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required')
], requestEmailChange);

// @route   POST /api/profile/confirm-email-change
// @desc    Confirm email change with OTP
// @access  Private
router.post('/confirm-email-change', [
    body('newEmail')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('otp')
        .trim()
        .isLength({ min: 4, max: 4 })
        .withMessage('OTP must be exactly 4 digits')
        .isNumeric()
        .withMessage('OTP must contain only numbers')
], confirmEmailChange);

module.exports = router;