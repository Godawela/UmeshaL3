const QuickTip = require('../models/quickTipModel');
const Category = require('../models/categoryModel');

class QuickTipService {
  
  // Get quick tips for a specific category
  async getQuickTipsByCategory(categoryId) {
    try {
      // Validate if category exists
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        throw new Error('Category not found');
      }

      const quickTips = await QuickTip.findByCategoryId(categoryId);
      
      if (!quickTips) {
        return {
          categoryName: categoryExists.name,
          tips: []
        };
      }

      // Filter active tips and sort by priority
      const activeTips = quickTips.tips
        .filter(tip => tip.isActive)
        .sort((a, b) => b.priority - a.priority);

      return {
        categoryName: quickTips.categoryId.name,
        categoryDescription: quickTips.categoryId.description,
        tips: activeTips,
        totalTips: activeTips.length
      };
    } catch (error) {
      throw new Error(`Error fetching quick tips: ${error.message}`);
    }
  }

  // Create or update quick tips for a category
  async createOrUpdateQuickTips(categoryId, tipsData) {
    try {
      // Validate if category exists
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        throw new Error('Category not found');
      }

      // Validate tips data
      if (!Array.isArray(tipsData) || tipsData.length === 0) {
        throw new Error('Tips data must be a non-empty array');
      }

      // Validate each tip
      for (const tip of tipsData) {
        if (!tip.title || !tip.content) {
          throw new Error('Each tip must have title and content');
        }
        if (tip.priority && (tip.priority < 1 || tip.priority > 5)) {
          throw new Error('Priority must be between 1 and 5');
        }
      }

      let quickTip = await QuickTip.findOne({ categoryId });
      
      if (quickTip) {
        // Update existing quick tips
        quickTip.tips = tipsData;
        await quickTip.save();
      } else {
        // Create new quick tips entry
        quickTip = new QuickTip({
          categoryId,
          tips: tipsData
        });
        await quickTip.save();
      }

      return await QuickTip.findByCategoryId(categoryId);
    } catch (error) {
      throw new Error(`Error saving quick tips: ${error.message}`);
    }
  }

  // Add a single tip to existing category
  async addSingleTip(categoryId, tipData) {
    try {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        throw new Error('Category not found');
      }

      if (!tipData.title || !tipData.content) {
        throw new Error('Tip must have title and content');
      }

      let quickTip = await QuickTip.findOne({ categoryId });
      
      if (!quickTip) {
        quickTip = new QuickTip({
          categoryId,
          tips: [tipData]
        });
      } else {
        quickTip.tips.push(tipData);
      }

      await quickTip.save();
      return await QuickTip.findByCategoryId(categoryId);
    } catch (error) {
      throw new Error(`Error adding tip: ${error.message}`);
    }
  }

  // Update a specific tip
  async updateTip(categoryId, tipId, updateData) {
    try {
      const quickTip = await QuickTip.findOne({ categoryId });
      if (!quickTip) {
        throw new Error('Quick tips not found for this category');
      }

      const tip = quickTip.tips.id(tipId);
      if (!tip) {
        throw new Error('Tip not found');
      }

      // Update tip properties
      Object.keys(updateData).forEach(key => {
        if (key !== '_id') {
          tip[key] = updateData[key];
        }
      });

      await quickTip.save();
      return await QuickTip.findByCategoryId(categoryId);
    } catch (error) {
      throw new Error(`Error updating tip: ${error.message}`);
    }
  }

  // Delete a specific tip
  async deleteTip(categoryId, tipId) {
  try {
    console.log('Attempting to delete tip:', { categoryId, tipId }); // Debug log
    
    const quickTip = await QuickTip.findOne({ categoryId });
    if (!quickTip) {
      throw new Error('Quick tips not found for this category');
    }

    console.log('Found quickTip document:', quickTip._id); // Debug log
    console.log('Tips array length before deletion:', quickTip.tips.length); // Debug log

    quickTip.tips.pull({ _id: tipId });
    await quickTip.save();

    console.log('Tips array length after deletion:', quickTip.tips.length); // Debug log
    
    return await QuickTip.findByCategoryId(categoryId);
  } catch (error) {
    console.error('Delete tip error:', error); // Debug log
    throw new Error(`Error deleting tip: ${error.message}`);
  }
}
  // Get all quick tips (for admin purposes)
  async getAllQuickTips() {
    try {
      const allQuickTips = await QuickTip.find()
        .populate('categoryId', 'name description')
        .sort({ createdAt: -1 });

      return allQuickTips.map(qt => ({
        categoryId: qt.categoryId._id,
        categoryName: qt.categoryId.name,
        categoryDescription: qt.categoryId.description,
        tipsCount: qt.tips.filter(tip => tip.isActive).length,
        lastUpdated: qt.updatedAt
      }));
    } catch (error) {
      throw new Error(`Error fetching all quick tips: ${error.message}`);
    }
  }
}

module.exports = new QuickTipService();