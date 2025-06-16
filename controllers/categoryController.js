const Category = require('../models/categoryModel');


// Get category description by category name
exports.getCategoryDescriptionByName = async (req, res) => {

    try {
        console.log('Looking for category with name:', req.params.name);
        const category = await Category.findOne({ name: req.params.name });

        if (!category) {
            console.log('Category not found');
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({
            _id: category._id,  // Include the ID
            description: category.description
        });
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: error.message });
    }
};

// Add a new category
exports.addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if the category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        // Create a new category
        const newCategory = new Category({ name, description });
        await newCategory.save();

        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update an existing category
// categoryController.js
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const { id } = req.params;

        console.log(`Updating category ${id} with`, {name, description}); // Debug log

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`Deleting category ${id}`);
        const deletedCategory = await Category.findByIdAndDelete(id);
        
        if (!deletedCategory) {
            console.log('Category not found for deletion');
            return res.status(404).json({ error: 'Category not found' });
        }
        
        console.log('Successfully deleted:', deletedCategory);
        res.status(200).json({ 
            message: 'Category deleted successfully',
            deletedId: id // Return the deleted ID for verification
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ 
            error: error.message,
            deleted: false 
        });
    }
};

// Get all categories   
exports.getAllCategories = async (req, res) => {
  try {
    console.log('Fetching from collection:', Category.collection.collectionName);
    const categories = await Category.find({});
    console.log('Found categories:', categories);
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: error.message });
  }
};

