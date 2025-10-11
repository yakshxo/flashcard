const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory for processing

// File filter function
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedMimeTypes = [
        'application/pdf',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword' // .doc
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, TXT, DOC, and DOCX files are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
        files: 1 // Only allow 1 file
    }
});

// Middleware for single file upload
const uploadSingle = upload.single('file');

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Only 1 file allowed.'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field name. Use "file" as the field name.'
            });
        }
        return res.status(400).json({
            success: false,
            message: 'File upload error: ' + error.message
        });
    }
    
    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
};

// Combined middleware
const uploadMiddleware = (req, res, next) => {
    uploadSingle(req, res, (error) => {
        if (error) {
            return handleUploadError(error, req, res, next);
        }
        next();
    });
};

// Profile picture upload configuration
const fs = require('fs');

// Create profiles upload directory
const profilesDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
}

// Storage for profile pictures
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, profilesDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: userId_timestamp.extension
        const uniqueName = `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// File filter for profile images
const profileImageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed for profile pictures!'), false);
    }
};

// Configure profile picture upload
const profileUpload = multer({
    storage: profileStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1
    },
    fileFilter: profileImageFilter
});

// Middleware for profile picture upload
const uploadProfilePicture = profileUpload.single('profileImage');

// Helper function to delete old profile picture
const deleteOldProfilePicture = (filePath) => {
    if (filePath) {
        const fullPath = path.join(__dirname, '../', filePath);
        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
                console.log('Deleted old profile picture:', fullPath);
            } catch (error) {
                console.error('Error deleting old profile picture:', error);
            }
        }
    }
};

module.exports = {
    uploadMiddleware,
    uploadSingle,
    handleUploadError,
    uploadProfilePicture,
    deleteOldProfilePicture
};
