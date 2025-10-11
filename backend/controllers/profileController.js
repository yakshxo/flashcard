const User = require('../models/User');
const { validationResult } = require('express-validator');
const { deleteOldProfilePicture } = require('../middleware/upload');
const { sendOTPEmail } = require('../services/emailService');
const path = require('path');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                birthDate: user.birthDate,
                schoolName: user.schoolName,
                phoneNumber: user.phoneNumber,
                flashcardCredits: user.flashcardCredits,
                subscriptionStatus: user.subscriptionStatus,
                isDeveloper: user.isDeveloper,
                hasUnlimitedCredits: user.hasUnlimitedCredits,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { schoolName, phoneNumber } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update allowed fields
        if (schoolName !== undefined) user.schoolName = schoolName;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                birthDate: user.birthDate,
                schoolName: user.schoolName,
                phoneNumber: user.phoneNumber,
                flashcardCredits: user.flashcardCredits,
                subscriptionStatus: user.subscriptionStatus,
                isDeveloper: user.isDeveloper,
                hasUnlimitedCredits: user.hasUnlimitedCredits,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Upload profile picture
// @route   POST /api/profile/upload-picture
// @access  Private
const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete old profile picture if exists
        if (user.profileImage) {
            deleteOldProfilePicture(user.profileImage);
        }

        // Save new profile picture path
        const profileImagePath = `/uploads/profiles/${req.file.filename}`;
        user.profileImage = profileImagePath;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            data: {
                profileImage: profileImagePath
            }
        });
    } catch (error) {
        console.error('Upload profile picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Delete profile picture
// @route   DELETE /api/profile/picture
// @access  Private
const deleteProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.profileImage) {
            return res.status(400).json({
                success: false,
                message: 'No profile picture to delete'
            });
        }

        // Delete the file
        deleteOldProfilePicture(user.profileImage);
        
        // Remove from database
        user.profileImage = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture deleted successfully'
        });
    } catch (error) {
        console.error('Delete profile picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Request email change (send OTP)
// @route   POST /api/profile/request-email-change
// @access  Private
const requestEmailChange = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { newEmail, currentPassword } = req.body;
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isPasswordValid = await user.matchPassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Check if new email is already taken
        const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Email address is already in use'
            });
        }

        // Generate and send OTP
        const otp = user.generateOTP();
        await user.save();

        const emailResult = await sendOTPEmail(newEmail, otp, user.name, false);
        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Verification code sent to new email address',
            data: {
                tempEmail: newEmail,
                otpSent: true
            }
        });
    } catch (error) {
        console.error('Request email change error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Confirm email change
// @route   POST /api/profile/confirm-email-change
// @access  Private
const confirmEmailChange = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { newEmail, otp } = req.body;
        const user = await User.findById(req.user.id).select('+otp +otpExpiry');

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

        // Update email
        user.email = newEmail.toLowerCase();
        user.clearOTP();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email address updated successfully',
            data: {
                email: user.email
            }
        });
    } catch (error) {
        console.error('Confirm email change error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    requestEmailChange,
    confirmEmailChange
};