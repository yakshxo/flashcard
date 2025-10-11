const { body } = require('express-validator');

// Validation rules for user registration
const validateRegister = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

// Validation rules for user login
const validateLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Validation rules for flashcard generation
const validateFlashcardGeneration = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    
    body('cardCount')
        .isInt({ min: 1, max: 100 })
        .withMessage('Card count must be between 1 and 100'),
    
    body('difficulty')
        .optional()
        .isIn(['easy', 'medium', 'hard', 'mixed'])
        .withMessage('Difficulty must be easy, medium, hard, or mixed'),
    
    body('subject')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Subject cannot exceed 100 characters'),
    
    body('customPrompt')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Custom prompt cannot exceed 1000 characters')
];

// Validation rules for OTP verification
const validateOTP = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('otp')
        .trim()
        .isLength({ min: 4, max: 4 })
        .withMessage('OTP must be exactly 4 digits')
        .isNumeric()
        .withMessage('OTP must contain only numbers'),
    
    body('isLogin')
        .optional()
        .isBoolean()
        .withMessage('isLogin must be a boolean')
];

// Validation rules for email only
const validateEmail = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('isLogin')
        .optional()
        .isBoolean()
        .withMessage('isLogin must be a boolean')
];

module.exports = {
    validateRegister,
    validateLogin,
    validateFlashcardGeneration,
    validateOTP,
    validateEmail
};
