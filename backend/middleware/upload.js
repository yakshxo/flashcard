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

module.exports = {
    uploadMiddleware,
    uploadSingle,
    handleUploadError
};