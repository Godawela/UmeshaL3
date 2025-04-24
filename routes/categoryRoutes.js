const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// CRUD routes for categories
router.get('/category/name/:name', categoryController.getCategoryDescriptionByName);

module.exports = router;
