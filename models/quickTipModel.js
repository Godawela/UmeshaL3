const mongoose = require('mongoose');

const quickTipSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  tips: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    icon: {
      type: String,
      default: 'lightbulb',
      trim: true
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
quickTipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find tips by category
quickTipSchema.statics.findByCategoryId = function(categoryId) {
  return this.findOne({ categoryId }).populate('categoryId', 'name description');
};

module.exports = mongoose.model('QuickTip', quickTipSchema);