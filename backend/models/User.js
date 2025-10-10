const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    flashcardCredits: {
        type: Number,
        default: 0,
        min: [0, 'Credits cannot be negative']
    },
    totalFlashcardsGenerated: {
        type: Number,
        default: 0
    },
    subscriptionStatus: {
        type: String,
        enum: ['free', 'premium', 'enterprise'],
        default: 'free'
    },
    stripeCustomerId: {
        type: String,
        default: null
    },
    isDeveloper: {
        type: Boolean,
        default: false
    },
    hasUnlimitedCredits: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) {
        next();
    }

    // Hash the password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Deduct credits
userSchema.methods.deductCredits = async function(amount) {
    // Skip deduction for users with unlimited credits
    if (this.hasUnlimitedCredits) {
        return this;
    }
    
    if (this.flashcardCredits < amount) {
        throw new Error('Insufficient credits');
    }
    this.flashcardCredits -= amount;
    return await this.save();
};

// Add credits
userSchema.methods.addCredits = async function(amount) {
    this.flashcardCredits += amount;
    return await this.save();
};

module.exports = mongoose.model('User', userSchema);