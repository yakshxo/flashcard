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
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
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

module.exports = {
    validateRegister,
    validateLogin,
    validateFlashcardGeneration
};