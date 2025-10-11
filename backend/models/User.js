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
    isVerified: {
        type: Boolean,
        default: false
    },
    profileImage: {
        type: String,
        default: null
    },
    birthDate: {
        type: Date,
        default: null
    },
    schoolName: {
        type: String,
        trim: true,
        maxlength: [100, 'School name cannot exceed 100 characters'],
        default: null
    },
    phoneNumber: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true; // Allow empty phone numbers
                return /^[\+]?[1-9][\d]{0,15}$/.test(v); // Basic international phone format
            },
            message: 'Please enter a valid phone number'
        },
        default: null
    },
    otp: {
        type: String,
        select: false
    },
    otpExpiry: {
        type: Date,
        select: false
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

// Generate OTP for email verification
userSchema.methods.generateOTP = function() {
    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Set OTP and expiry (10 minutes from now)
    this.otp = otp;
    this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(enteredOTP) {
    // Check if OTP exists and hasn't expired
    if (!this.otp || !this.otpExpiry) {
        return false;
    }
    
    if (this.otpExpiry < new Date()) {
        return false;
    }
    
    return this.otp === enteredOTP;
};

// Clear OTP after verification
userSchema.methods.clearOTP = function() {
    this.otp = undefined;
    this.otpExpiry = undefined;
    this.isVerified = true;
};

module.exports = mongoose.model('User', userSchema);
