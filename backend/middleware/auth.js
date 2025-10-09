const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes middleware
const protect = async (req, res, next) => {
    let token;

    // Check if token is sent in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Also check for token in cookies (for browser requests)
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route - No token provided'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from token
        req.user = await User.findById(decoded.id);
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized - User not found'
            });
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Not authorized - Token is invalid'
        });
    }
};

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.subscriptionStatus)) {
            return res.status(403).json({
                success: false,
                message: `User subscription status '${req.user.subscriptionStatus}' is not authorized to access this route`
            });
        }
        next();
    };
};

// Check if user has enough credits
const checkCredits = (requiredCredits) => {
    return (req, res, next) => {
        if (req.user.flashcardCredits < requiredCredits) {
            return res.status(402).json({
                success: false,
                message: `Insufficient credits. Required: ${requiredCredits}, Available: ${req.user.flashcardCredits}`,
                requiredCredits,
                availableCredits: req.user.flashcardCredits
            });
        }
        next();
    };
};

module.exports = {
    protect,
    authorize,
    checkCredits
};