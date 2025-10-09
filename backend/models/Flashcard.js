const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Flashcard set title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    cards: [{
        question: {
            type: String,
            required: [true, 'Question is required'],
            trim: true
        },
        answer: {
            type: String,
            required: [true, 'Answer is required'],
            trim: true
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        },
        tags: [{
            type: String,
            trim: true
        }]
    }],
    sourceFile: {
        originalName: String,
        fileName: String,
        filePath: String,
        fileSize: Number,
        mimeType: String
    },
    generationSettings: {
        cardCount: {
            type: Number,
            required: true,
            min: 1,
            max: 100
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard', 'mixed'],
            default: 'medium'
        },
        subject: {
            type: String,
            trim: true
        },
        customPrompt: {
            type: String,
            trim: true,
            maxlength: [1000, 'Custom prompt cannot exceed 1000 characters']
        }
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downloadCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['generating', 'completed', 'failed'],
        default: 'generating'
    },
    generationError: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better performance
flashcardSchema.index({ user: 1, createdAt: -1 });
flashcardSchema.index({ isPublic: 1, createdAt: -1 });
flashcardSchema.index({ 'generationSettings.subject': 1 });

// Virtual for card count
flashcardSchema.virtual('cardCount').get(function() {
    return this.cards.length;
});

// Virtual for like count
flashcardSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

// Method to add a like
flashcardSchema.methods.addLike = async function(userId) {
    if (!this.likes.includes(userId)) {
        this.likes.push(userId);
        return await this.save();
    }
    return this;
};

// Method to remove a like
flashcardSchema.methods.removeLike = async function(userId) {
    this.likes = this.likes.filter(like => !like.equals(userId));
    return await this.save();
};

// Method to increment download count
flashcardSchema.methods.incrementDownload = async function() {
    this.downloadCount += 1;
    return await this.save();
};

module.exports = mongoose.model('Flashcard', flashcardSchema);