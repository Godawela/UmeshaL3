const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String, // Store file path or URL
        required: false,
        default: null
    },
    
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;