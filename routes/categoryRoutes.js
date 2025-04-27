const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// CRUD routes for categories
router.get('/category/name/:name', categoryController.getCategoryDescriptionByName);
router.post('/category', categoryController.addCategory);
router.put('/category/:id', categoryController.updateCategory);
router.delete('/category/:id', categoryController.deleteCategory); 
router.get('/category', categoryController.getAllCategories);

module.exports = router;
