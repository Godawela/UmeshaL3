const Category = require('../models/categoryModel');


// Get category description by category name
exports.getCategoryDescriptionByName = async (req, res) => {
    try {
        console.log('Looking for category with name:', req.params.name);

        const all = await Category.find({});
        console.log('All categories in DB:', all); // <-- check what’s really in there

        const category = await Category.findOne({ name: req.params.name });

        if (!category) {
            console.log('Category not found');
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({ description: category.description });
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
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const { id } = req.params;

        // Find the category by ID and update it
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the category by ID and delete it
        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all categories   
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: error.message });
    }
};

