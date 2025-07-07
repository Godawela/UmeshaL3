const Category = require('../models/categoryModel');
const cloudinary = require('../config/cloudinary');

// Helper function to extract public_id from Cloudinary URL
const extractPublicId = (url) => {
    if (!url) return null;
    
    // Extract public_id from Cloudinary URL
    const matches = url.match(/\/([^\/]+)\.(jpg|jpeg|png|gif|webp|bmp|tiff|svg)$/);
    return matches ? matches[1] : null;
};

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
        console.log('=== ADD CATEGORY DEBUG ===');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        
        const { name, description } = req.body;

        // Validate required fields
        if (!name || !description) {
            console.log('Missing required fields');
            // Clean up uploaded file if validation fails
            if (req.file && req.file.public_id) {
                try {
                    await cloudinary.uploader.destroy(req.file.public_id);
                    console.log('Cleaned up uploaded file due to validation error');
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', cleanupError);
                }
            }
            return res.status(400).json({ error: 'Name and description are required' });
        }

        // Check if the category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            console.log('Category already exists');
            // Delete uploaded file from Cloudinary if category exists
            if (req.file && req.file.public_id) {
                try {
                    await cloudinary.uploader.destroy(req.file.public_id);
                    console.log('Cleaned up uploaded file due to existing category');
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', cleanupError);
                }
            }
            return res.status(400).json({ error: 'Category already exists' });
        }

        // Prepare category data
        const categoryData = { name, description };
        
        // Add image URL if file was uploaded
        if (req.file) {
            console.log('File uploaded successfully to Cloudinary:', {
                url: req.file.path,
                public_id: req.file.public_id,
                secure_url: req.file.secure_url
            });
            categoryData.image = req.file.secure_url || req.file.path; // Use secure_url if available
        } else {
            console.log('No file uploaded');
        }

        console.log('Category data to save:', categoryData);

        // Create a new category
        const newCategory = new Category(categoryData);
        const savedCategory = await newCategory.save();

        console.log('Category saved successfully:', savedCategory);
        res.status(201).json(savedCategory);
        
    } catch (error) {
        console.error('Error in addCategory:', error);
        console.error('Error stack:', error.stack);
        
        // Delete uploaded file from Cloudinary if there was an error
        if (req.file && req.file.public_id) {
            try {
                await cloudinary.uploader.destroy(req.file.public_id);
                console.log('Cleaned up uploaded file due to error');
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }
        
        res.status(500).json({ 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Update an existing category with image
exports.updateCategory = async (req, res) => {
    try {
        console.log('=== UPDATE CATEGORY DEBUG ===');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        console.log('Request params:', req.params);
        
        const { name, description, removeImage } = req.body;
        const { id } = req.params;

        console.log(`Updating category ${id} with`, { name, description, removeImage });

        // Find the existing category
        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            console.log('Category not found for update');
            // Delete uploaded file from Cloudinary if category doesn't exist
            if (req.file && req.file.public_id) {
                try {
                    await cloudinary.uploader.destroy(req.file.public_id);
                    console.log('Cleaned up uploaded file - category not found');
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', cleanupError);
                }
            }
            return res.status(404).json({ error: 'Category not found' });
        }

        // Prepare update data
        const updateData = { name, description };

        // Handle image operations
        if (removeImage === 'true') {
            console.log('Removing image from category');
            if (existingCategory.image) {
                const publicId = extractPublicId(existingCategory.image);
                if (publicId) {
                    try {
                        await cloudinary.uploader.destroy(`categories/${publicId}`);
                        console.log('Deleted existing image from Cloudinary:', publicId);
                    } catch (deleteError) {
                        console.error('Error deleting existing image:', deleteError);
                    }
                }
            }
            updateData.image = null; 
            
            // Clean up any newly uploaded file since we're removing the image
            if (req.file && req.file.public_id) {
                try {
                    await cloudinary.uploader.destroy(req.file.public_id);
                    console.log('Cleaned up newly uploaded file - removing image');
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', cleanupError);
                }
            }
        } else if (req.file) {
            console.log('Replacing image');
            // Replace with new image
            // Delete old image from Cloudinary if it exists
            if (existingCategory.image) {
                const publicId = extractPublicId(existingCategory.image);
                if (publicId) {
                    try {
                        await cloudinary.uploader.destroy(`categories/${publicId}`);
                        console.log('Deleted old image from Cloudinary:', publicId);
                    } catch (deleteError) {
                        console.error('Error deleting old image:', deleteError);
                    }
                }
            }
            updateData.image = req.file.secure_url || req.file.path; // Use secure_url if available
        }

        console.log('Update data:', updateData);

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        console.log('Category updated successfully:', updatedCategory);
        res.status(200).json(updatedCategory);
        
    } catch (error) {
        console.error('Update error:', error);
        console.error('Error stack:', error.stack);
        
        // Delete uploaded file from Cloudinary if there was an error
        if (req.file && req.file.public_id) {
            try {
                await cloudinary.uploader.destroy(req.file.public_id);
                console.log('Cleaned up uploaded file due to update error');
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }
        
        res.status(500).json({ 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

        // Delete associated image file from Cloudinary
        if (deletedCategory.image) {
            const publicId = extractPublicId(deletedCategory.image);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(`categories/${publicId}`);
                    console.log('Deleted image from Cloudinary:', publicId);
                } catch (deleteError) {
                    console.error('Error deleting image from Cloudinary:', deleteError);
                }
            }
        }
        
        console.log('Successfully deleted:', deletedCategory);
        res.status(200).json({ 
            message: 'Category deleted successfully',
            deletedId: id
        });
        
    } catch (error) {
        console.error('Delete error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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