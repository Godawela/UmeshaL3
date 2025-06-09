const quickTipService = require('../services/quickTipService');

class QuickTipController {
  
  // GET /api/quicktips/category/:categoryId
  async getQuickTipsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      
      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Category ID is required'
        });
      }

      const result = await quickTipService.getQuickTipsByCategory(categoryId);
      
      res.status(200).json({
        success: true,
        message: 'Quick tips retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/quicktips/category/:categoryId
  async createOrUpdateQuickTips(req, res) {
    try {
      const { categoryId } = req.params;
      const { tips } = req.body;

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Category ID is required'
        });
      }

      const result = await quickTipService.createOrUpdateQuickTips(categoryId, tips);
      
      res.status(201).json({
        success: true,
        message: 'Quick tips saved successfully',
        data: result
      });
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/quicktips/category/:categoryId/tip
  async addSingleTip(req, res) {
    try {
      const { categoryId } = req.params;
      const tipData = req.body;

      const result = await quickTipService.addSingleTip(categoryId, tipData);
      
      res.status(201).json({
        success: true,
        message: 'Tip added successfully',
        data: result
      });
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/quicktips/category/:categoryId/tip/:tipId
  async updateTip(req, res) {
    try {
      const { categoryId, tipId } = req.params;
      const updateData = req.body;

      const result = await quickTipService.updateTip(categoryId, tipId, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Tip updated successfully',
        data: result
      });
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/quicktips/category/:categoryId/tip/:tipId
  async deleteTip(req, res) {
    try {
      const { categoryId, tipId } = req.params;

      const result = await quickTipService.deleteTip(categoryId, tipId);
      
      res.status(200).json({
        success: true,
        message: 'Tip deleted successfully',
        data: result
      });
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/quicktips/all
  async getAllQuickTips(req, res) {
    try {
      const result = await quickTipService.getAllQuickTips();
      
      res.status(200).json({
        success: true,
        message: 'All quick tips retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new QuickTipController();