const Category = require('../models/categoryModel');



// Funtion to get category description by name
const getCategoryDescriptionByName = async (name) => {
    return await Category.findOne({ name: name });
};

// Function to create a new category
const createCategory = async (name, description) => {
    const newCategory = new Category({ name, description });
    await newCategory.save();
    return newCategory;
};

// Function to update an existing category
const updateCategory = async (id, name, description) => {
    const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { name, description },
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