const express = require('express');
const categoryController = require('../controllers/categoryController');
const upload = require('../config/multer'); // Import multer config
const path = require('path');

const router = express.Router();

// CRUD routes for categories
router.get('/category/name/:name', categoryController.getCategoryDescriptionByName);

// Add single image upload to POST and PUT routes
router.post('/category', upload.single('image'), categoryController.addCategory);
router.put('/category/:id', upload.single('image'), categoryController.updateCategory);

router.delete('/category/:id', categoryController.deleteCategory); 
router.get('/category', categoryController.getAllCategories);

// Serve uploaded images statically
// Add this route to serve images
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