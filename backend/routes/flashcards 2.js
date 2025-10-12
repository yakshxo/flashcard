const express = require('express');
const {
    generateFromText,
    generateFromFile,
    getMyFlashcards,
    getFlashcardSet,
    deleteFlashcardSet
} = require('../controllers/flashcardController');
const { protect } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload');
const { validateFlashcardGeneration } = require('../middleware/validation');

const router = express.Router();

// All routes are protected - user must be logged in
router.use(protect);

// @route   POST /api/flashcards/generate-text
// @desc    Generate flashcards from text content
// @access  Private
router.post('/generate-text', [
    ...validateFlashcardGeneration,
    // Additional validation for text content
    require('express-validator').body('content')
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 50 })
        .withMessage('Content must be at least 50 characters long')
], generateFromText);

// @route   POST /api/flashcards/generate-file
// @desc    Generate flashcards from uploaded file
// @access  Private
router.post('/generate-file', [
    uploadMiddleware,
    // Validate the non-file fields
    require('express-validator').body('cardCount')
        .isInt({ min: 1, max: 100 })
        .withMessage('Card count must be between 1 and 100'),
    require('express-validator').body('difficulty')
        .optional()
        .isIn(['easy', 'medium', 'hard', 'mixed'])
        .withMessage('Difficulty must be easy, medium, hard, or mixed')
], generateFromFile);

// @route   GET /api/flashcards
// @desc    Get all flashcard sets for the logged-in user
// @access  Private
router.get('/', getMyFlashcards);

// @route   GET /api/flashcards/:id
// @desc    Get a specific flashcard set
// @access  Private
router.get('/:id', getFlashcardSet);

// @route   DELETE /api/flashcards/:id
// @desc    Delete a flashcard set
// @access  Private
router.delete('/:id', deleteFlashcardSet);

module.exports = router;