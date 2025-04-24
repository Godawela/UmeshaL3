const Category = require('../models/categoryModel');



// Funtion to get category description by name
const getCategoryDescriptionByName = async (name) => {
    return await Category.findOne({ name: name });
};


module.exports = {
    getCategoryDescriptionByName
};