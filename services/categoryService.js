const Category = require('../models/categoryModel');

// Function to get category description by name
const getCategoryDescriptionByName = async (name) => {
    return await Category.findOne({ name: name });
};

// Function to create a new category with image
const createCategory = async (name, description, imagePath = null) => {
    const categoryData = { name, description };
    if (imagePath) {
        categoryData.image = imagePath;
    }
    
    const newCategory = new Category(categoryData);
    await newCategory.save();
    return newCategory;
};

// Function to update an existing category with image
const updateCategory = async (id, name, description, imagePath = null) => {
    const updateData = { name, description };
    if (imagePath) {
        updateData.image = imagePath;
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
    );
    return updatedCategory;
};

// Function to delete a category by ID
const deleteCategory = async (id) => {
    const deletedCategory = await Category.findByIdAndDelete(id);
    return deletedCategory;
};

// Function to get all unique categories
const getAllCategories = async () => {
    return await Category.find({});
};

module.exports = {
    getCategoryDescriptionByName,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
};