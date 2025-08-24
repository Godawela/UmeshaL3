const Symptom = require('../models/symptomModel');
const cloudinary = require('../config/cloudinary');

// Helper function to extract public_id from Cloudinary URL
const extractPublicId = (url) => {
    if (!url) return null;
    const matches = url.match(/\/([^\/]+)\.(jpg|jpeg|png|gif|webp|bmp|tiff|svg)$/);
    return matches ? matches[1] : null;
};

// Create a new symptom with optional image
exports.createSymptom = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validation
        if (!name || !description) {
            if (req.file && req.file.public_id) {
                await cloudinary.uploader.destroy(req.file.public_id);
            }
            return res.status(400).json({ error: 'Name and description are required' });
        }

        // Check if symptom already exists
        const existingSymptom = await Symptom.findOne({ name });
        if (existingSymptom) {
            if (req.file && req.file.public_id) {
                await cloudinary.uploader.destroy(req.file.public_id);
            }
            return res.status(400).json({ error: 'Symptom already exists' });
        }

        // Prepare symptom data
        const symptomData = { name, description };

        // Add image if uploaded
        if (req.file) {
            symptomData.image = req.file.secure_url || req.file.path;
        }

        const symptom = new Symptom(symptomData);
        await symptom.save();
        res.status(201).json(symptom);
    } catch (error) {
        if (req.file && req.file.public_id) {
            await cloudinary.uploader.destroy(req.file.public_id);
        }
        res.status(500).json({ error: error.message });
    }
};

// Update a symptom by ID (with optional image handling)
exports.updateSymptom = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, removeImage } = req.body;

        const existingSymptom = await Symptom.findById(id);
        if (!existingSymptom) {
            if (req.file && req.file.public_id) {
                await cloudinary.uploader.destroy(req.file.public_id);
            }
            return res.status(404).json({ error: 'Symptom not found' });
        }

        const updateData = { name, description };

        // Remove image if requested
        if (removeImage === 'true') {
            if (existingSymptom.image) {
                const publicId = extractPublicId(existingSymptom.image);
                if (publicId) {
                    await cloudinary.uploader.destroy(`symptoms/${publicId}`);
                }
            }
            updateData.image = null;

            if (req.file && req.file.public_id) {
                await cloudinary.uploader.destroy(req.file.public_id);
            }
        } else if (req.file) {
            // Replace old image with new one
            if (existingSymptom.image) {
                const publicId = extractPublicId(existingSymptom.image);
                if (publicId) {
                    await cloudinary.uploader.destroy(`symptoms/${publicId}`);
                }
            }
            updateData.image = req.file.secure_url || req.file.path;
        }

        const updatedSymptom = await Symptom.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json(updatedSymptom);
    } catch (error) {
        if (req.file && req.file.public_id) {
            await cloudinary.uploader.destroy(req.file.public_id);
        }
        res.status(500).json({ error: error.message });
    }
};

// Delete a symptom by ID (including image cleanup)
exports.deleteSymptom = async (req, res) => {
    try {
        const { id } = req.params;
        const symptom = await Symptom.findByIdAndDelete(id);
        if (!symptom) return res.status(404).json({ error: 'Symptom not found' });

        if (symptom.image) {
            const publicId = extractPublicId(symptom.image);
            if (publicId) {
                await cloudinary.uploader.destroy(`symptoms/${publicId}`);
            }
        }

        res.status(200).json({ message: 'Symptom deleted successfully', symptom });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
