// config/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/categories';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Improved file filter with debugging and more flexible validation
const fileFilter = (req, file, cb) => {
    console.log('File details:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    });

    // List of allowed image MIME types
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/tiff',
        'image/svg+xml'
    ];

    // List of allowed file extensions
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'];

    // Get file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Check both MIME type and file extension
    const isMimeTypeValid = allowedMimeTypes.includes(file.mimetype);
    const isExtensionValid = allowedExtensions.includes(fileExtension);

    if (isMimeTypeValid || isExtensionValid) {
        console.log('File accepted:', file.originalname);
        cb(null, true);
    } else {
        console.log('File rejected:', {
            filename: file.originalname,
            mimetype: file.mimetype,
            extension: fileExtension
        });
        cb(new Error(`Only image files are allowed! Received: ${file.mimetype} with extension ${fileExtension}`), false);
    }
};

// Configure multer with error handling
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // Increased to 10MB for camera photos
    }
});

module.exports = upload;