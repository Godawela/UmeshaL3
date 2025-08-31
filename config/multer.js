const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
const path = require('path');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'categories', 
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'],
        transformation: [
            {
                width: 800,
                height: 600,
                crop: 'limit',
                quality: 'auto:good'
            }
        ],
        public_id: (req, file) => {
            // Generate unique public_id
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `category-${uniqueSuffix}`;
        }
    }
});

// Simplified file filter for better debugging
const fileFilter = (req, file, cb) => {
    console.log('=== FILE FILTER DEBUG ===');
    console.log('File details:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname
    });

    // List of allowed image MIME types (including mobile-friendly ones)
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/tiff',
        'image/svg+xml',
        'application/octet-stream' // Common for mobile uploads
    ];

    // List of allowed file extensions
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'];

    // Get file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Check MIME type
    if (allowedMimeTypes.includes(file.mimetype)) {
        console.log('File accepted (valid MIME type):', file.originalname);
        return cb(null, true);
    }

    // If MIME type check fails, check extension as fallback
    if (allowedExtensions.includes(fileExtension)) {
        console.log('File accepted (valid extension):', file.originalname);
        return cb(null, true);
    }

    // Reject the file
    console.log('File rejected:', {
        filename: file.originalname,
        mimetype: file.mimetype,
        extension: fileExtension
    });
    cb(new Error(`Only image files are allowed! Received: ${file.mimetype} for file: ${file.originalname}`), false);
};

// Configure multer with Cloudinary storage
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// Add error handling middleware
const handleMulterError = (err, req, res, next) => {
    console.error('Multer error:', err);
    
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({ error: 'Too many files. Only one file is allowed.' });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({ error: 'Unexpected file field. Use "image" as the field name.' });
            default:
                return res.status(400).json({ error: `File upload error: ${err.message}` });
        }
    } else if (err.message.includes('Only image files are allowed')) {
        return res.status(400).json({ error: err.message });
    }
    
    next(err);
};

module.exports = { upload, handleMulterError };