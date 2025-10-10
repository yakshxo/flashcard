const Flashcard = require('../models/Flashcard');
const User = require('../models/User');
const { generateFlashcards } = require('../services/aiService');
const { validationResult } = require('express-validator');
const pdfParse = require('pdf-parse');

// @desc    Generate flashcards from text
// @route   POST /api/flashcards/generate-text
// @access  Private
const generateFromText = async (req, res) => {
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

        const {
            title,
            description,
            content,
            cardCount,
            difficulty,
            subject,
            customPrompt
        } = req.body;

        // Check if user has enough credits (skip for unlimited users)
        const creditsNeeded = Math.ceil(cardCount / 10); // 1 credit per 10 cards
        if (!req.user.hasUnlimitedCredits && req.user.flashcardCredits < creditsNeeded) {
            return res.status(402).json({
                success: false,
                message: `Insufficient credits. Need ${creditsNeeded}, have ${req.user.flashcardCredits}`,
                requiredCredits: creditsNeeded,
                availableCredits: req.user.flashcardCredits
            });
        }

        // Create flashcard document with generating status
        const flashcardSet = await Flashcard.create({
            user: req.user._id,
            title,
            description,
            cards: [],
            generationSettings: {
                cardCount,
                difficulty: difficulty || 'medium',
                subject,
                customPrompt
            },
            status: 'generating'
        });

        // Generate flashcards using AI service in background
        try {
            const generatedCards = await generateFlashcards(content, {
                cardCount,
                difficulty,
                subject,
                customPrompt
            });

            // Update flashcard set with generated cards
            flashcardSet.cards = generatedCards;
            flashcardSet.status = 'completed';
            await flashcardSet.save();

            // Deduct credits from user
            await req.user.deductCredits(creditsNeeded);
            req.user.totalFlashcardsGenerated += generatedCards.length;
            await req.user.save();

            res.status(201).json({
                success: true,
                message: 'Flashcards generated successfully',
                data: {
                    flashcardSet,
                    creditsUsed: req.user.hasUnlimitedCredits ? 0 : creditsNeeded,
                    remainingCredits: req.user.hasUnlimitedCredits ? 999999 : (req.user.flashcardCredits - creditsNeeded)
                }
            });

        } catch (generationError) {
            // Update status to failed
            flashcardSet.status = 'failed';
            flashcardSet.generationError = generationError.message;
            await flashcardSet.save();

            throw generationError;
        }

    } catch (error) {
        console.error('Generate flashcards error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate flashcards',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Generate flashcards from uploaded file
// @route   POST /api/flashcards/generate-file
// @access  Private
const generateFromFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const {
            title,
            description,
            cardCount,
            difficulty,
            subject,
            customPrompt
        } = req.body;

        let content = '';

        // Extract text based on file type
        if (req.file.mimetype === 'application/pdf') {
            const pdfData = await pdfParse(req.file.buffer);
            content = pdfData.text;
        } else if (req.file.mimetype === 'text/plain') {
            content = req.file.buffer.toString('utf-8');
        } else {
            return res.status(400).json({
                success: false,
                message: 'Unsupported file type. Please upload PDF or TXT files.'
            });
        }

        if (!content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'No text content found in the uploaded file'
            });
        }

        // Check credits (skip for unlimited users)
        const creditsNeeded = Math.ceil(parseInt(cardCount) / 10);
        if (!req.user.hasUnlimitedCredits && req.user.flashcardCredits < creditsNeeded) {
            return res.status(402).json({
                success: false,
                message: `Insufficient credits. Need ${creditsNeeded}, have ${req.user.flashcardCredits}`,
                requiredCredits: creditsNeeded,
                availableCredits: req.user.flashcardCredits
            });
        }

        // Create flashcard document
        const flashcardSet = await Flashcard.create({
            user: req.user._id,
            title: title || req.file.originalname.replace(/\.[^/.]+$/, ''),
            description,
            cards: [],
            sourceFile: {
                originalName: req.file.originalname,
                fileName: req.file.filename,
                fileSize: req.file.size,
                mimeType: req.file.mimetype
            },
            generationSettings: {
                cardCount: parseInt(cardCount),
                difficulty: difficulty || 'medium',
                subject,
                customPrompt
            },
            status: 'generating'
        });

        // Generate flashcards
        try {
            const generatedCards = await generateFlashcards(content, {
                cardCount: parseInt(cardCount),
                difficulty,
                subject,
                customPrompt
            });

            // Update flashcard set
            flashcardSet.cards = generatedCards;
            flashcardSet.status = 'completed';
            await flashcardSet.save();

            // Deduct credits
            await req.user.deductCredits(creditsNeeded);
            req.user.totalFlashcardsGenerated += generatedCards.length;
            await req.user.save();

            res.status(201).json({
                success: true,
                message: 'Flashcards generated successfully from file',
                data: {
                    flashcardSet,
                    creditsUsed: req.user.hasUnlimitedCredits ? 0 : creditsNeeded,
                    remainingCredits: req.user.hasUnlimitedCredits ? 999999 : (req.user.flashcardCredits - creditsNeeded)
                }
            });

        } catch (generationError) {
            flashcardSet.status = 'failed';
            flashcardSet.generationError = generationError.message;
            await flashcardSet.save();
            throw generationError;
        }

    } catch (error) {
        console.error('Generate from file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate flashcards from file',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get user's flashcard sets
// @route   GET /api/flashcards
// @access  Private
const getMyFlashcards = async (req, res) => {
    try {
        const flashcards = await Flashcard.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });
    } catch (error) {
        console.error('Get flashcards error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve flashcards',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get single flashcard set
// @route   GET /api/flashcards/:id
// @access  Private
const getFlashcardSet = async (req, res) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                message: 'Flashcard set not found'
            });
        }

        res.status(200).json({
            success: true,
            data: flashcardSet
        });
    } catch (error) {
        console.error('Get flashcard set error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve flashcard set',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Delete flashcard set
// @route   DELETE /api/flashcards/:id
// @access  Private
const deleteFlashcardSet = async (req, res) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                message: 'Flashcard set not found'
            });
        }

        await flashcardSet.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Flashcard set deleted successfully'
        });
    } catch (error) {
        console.error('Delete flashcard set error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete flashcard set',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

module.exports = {
    generateFromText,
    generateFromFile,
    getMyFlashcards,
    getFlashcardSet,
    deleteFlashcardSet
};