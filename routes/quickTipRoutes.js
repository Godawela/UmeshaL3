const express = require('express');
const router = express.Router();
const quickTipController = require('../controllers/quickTipController');


// Get quick tips for a specific category
router.get('/category/:categoryId', quickTipController.getQuickTipsByCategory);

// Create or update quick tips for a category
router.post('/category/:categoryId', quickTipController.createOrUpdateQuickTips);

// Add a single tip to a category
router.post('/category/:categoryId/tip', quickTipController.addSingleTip);

// Update a specific tip
router.put('/category/:categoryId/tip/:tipId', quickTipController.updateTip);

// Delete a specific tip
router.delete('/category/:categoryId/tip/:tipId', quickTipController.deleteTip);

// Get all quick tips (admin route)
router.get('/all', quickTipController.getAllQuickTips);

module.exports = router;

