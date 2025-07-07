const express = require('express');
const categoryController = require('../controllers/categoryController');
const { upload, handleMulterError } = require('../config/multer'); // Updated import
const path = require('path');

const router = express.Router();

// CRUD routes for categories
router.get('/category/name/:name', categoryController.getCategoryDescriptionByName);

// Add single image upload to POST and PUT routes with error handling
router.post('/category', upload.single('image'), handleMulterError, categoryController.addCategory);
router.put('/category/:id', upload.single('image'), handleMulterError, categoryController.updateCategory);

router.delete('/category/:id', categoryController.deleteCategory); 
router.get('/category', categoryController.getAllCategories);

// Test endpoint for debugging
router.post('/test-upload', upload.single('image'), handleMulterError, (req, res) => {
    try {
        console.log('=== TEST UPLOAD DEBUG ===');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file received' });
        }

        res.json({
            message: 'File uploaded successfully to Cloudinary',
            file: {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                url: req.file.path,
                secure_url: req.file.secure_url,
                public_id: req.file.public_id
            }
        });
    } catch (error) {
        console.error('Test upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve uploaded images statically (keeping for backward compatibility)
router.get('/uploads/categories/:filename', (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads/categories', filename);
    
    // Check if file exists
    if (require('fs').existsSync(imagePath)) {
        res.sendFile(path.resolve(imagePath));
    } else {
        res.status(404).json({ error: 'Image not found' });
    }
});

module.exports = router;