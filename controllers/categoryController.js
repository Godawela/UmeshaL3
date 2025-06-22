const Category = require('../models/categoryModel');
const fs = require('fs');
const path = require('path');

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
            _id: category._id,
            description: category.description,
            image: category.image
        });
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: error.message });
    }
};

// Add a new category with image
exports.addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if the category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            // Delete uploaded file if category exists
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ error: 'Category already exists' });
        }

        // Prepare category data
        const categoryData = { name, description };
        
        // Add image path if file was uploaded
        if (req.file) {
            categoryData.image = req.file.path;
        }

        // Create a new category
        const newCategory = new Category(categoryData);
        await newCategory.save();

        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error occurred:', error);
        // Delete uploaded file if there was an error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message });
    }
};

// Update an existing category with image
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const { id } = req.params;

        console.log(`Updating category ${id} with`, { name, description });

        // Find the existing category
        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            // Delete uploaded file if category doesn't exist
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ error: 'Category not found' });
        }

        // Prepare update data
        const updateData = { name, description };

        // Handle image update
        if (req.file) {
            // Delete old image if it exists
            if (existingCategory.image && fs.existsSync(existingCategory.image)) {
                fs.unlinkSync(existingCategory.image);
            }
            updateData.image = req.file.path;
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Update error:', error);
        // Delete uploaded file if there was an error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Delete a category and its image
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`Deleting category ${id}`);
        const deletedCategory = await Category.findByIdAndDelete(id);
        
        if (!deletedCategory) {
            console.log('Category not found for deletion');
            return res.status(404).json({ error: 'Category not found' });
        }

        // Delete associated image file
        if (deletedCategory.image && fs.existsSync(deletedCategory.image)) {
            fs.unlinkSync(deletedCategory.image);
            console.log('Deleted image file:', deletedCategory.image);
        }
        
        console.log('Successfully deleted:', deletedCategory);
        res.status(200).json({ 
            message: 'Category deleted successfully',
            deletedId: id
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