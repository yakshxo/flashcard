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
// Exact origins you accept (no trailing slashes)
const allowedOrigins = [
    process.env.FRONTEND_URL,            // e.g. "https://flaschard.vercel.app"
    'http://localhost:3000',
    // Optional: allow all vercel preview URLs for your app
    // use a function check below instead of listing them all
  ].filter(Boolean);
  
  const corsOptions = {
    origin: (origin, cb) => {
      // Allow non-browser tools (no origin)
      if (!origin) return cb(null, true);
  
      const isAllowed =
        allowedOrigins.includes(origin) ||
        // allow *.vercel.app previews if you want:
        /\.vercel\.app$/.test(new URL(origin).host);
  
      return cb(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
    },
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
    optionsSuccessStatus: 204, // default, fine
  };
  
  app.use(cors(corsOptions));
  // Ensure preflight hits CORS
  app.options('*', cors(corsOptions));
  
  // Security headers AFTER CORS
  app.use(helmet());

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
