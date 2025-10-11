const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for rate limiting (needed when behind reverse proxy)
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL, 'http://localhost:3000'] 
        : ['http://localhost:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// Basic health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Flashcard API Server is running',
        timestamp: new Date().toISOString()
    });
});

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/flashcards', require('./routes/flashcards'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/profile', require('./routes/profile'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!', 
        error: process.env.NODE_ENV === 'development' ? err.message : {} 
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Test email service on startup
const { testEmailConnection } = require('./services/emailService');

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    
    // Test email configuration
    console.log('\n📧 Testing email service...');
    const emailTest = await testEmailConnection();
    if (!emailTest.success) {
        console.log('⚠️  Email service not configured properly. OTP emails will not work.');
        console.log(`   Error: ${emailTest.error}`);
    }
});
