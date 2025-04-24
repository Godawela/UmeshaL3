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



