const Device = require('../models/deviceModel');

// Create a new device
exports.createDevice = async (req, res) => {
    try {
        const device = new Device(req.body);
        await device.save();
        res.status(201).json(device);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all devices
exports.getDevices = async (req, res) => {
    try {
        const devices = await Device.find({});
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a device by ID
exports.getDeviceById = async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);
        if (!device) return res.status(404).json({ error: 'Device not found' });
        res.status(200).json(device);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//get device by name
exports.getDeviceByName = async (req, res) => {
    try {
        const device = await Device.find({ name: req.params.name });
        if (!device) return res.status(404).json({ error: 'Device not found' });
        res.status(200).json(device);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get by category
exports.getDeviceByCategory = async (req, res) => {
    try {
        const devices = await Device.find({ category: req.params.category });
        if (!devices) return res.status(404).json({ error: 'Devices not found' });
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a device by ID
exports.updateDevice = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'category', 'description', 'reference', 'linkOfResource'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates!' });
    }

    try {
        const device = await Device.findById(req.params.id);
        if (!device) return res.status(404).json({ error: 'Device not found' });

        updates.forEach((update) => (device[update] = req.body[update]));
        await device.save();
        res.status(200).json(device);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a device by ID
exports.deleteDevice = async (req, res) => {
    try {
        const device = await Device.findByIdAndDelete(req.params.id);
        if (!device) return res.status(404).json({ error: 'Device not found' });

        res.status(200).json({ message: 'Device deleted successfully', device });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all unique categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Device.distinct('category');
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new category (by updating a device's category)
exports.createCategory = async (req, res) => {
    try {
        const { deviceId, category } = req.body;
        
        if (!deviceId || !category) {
            return res.status(400).json({ error: 'Device ID and category are required' });
        }
        
        const updatedDevice = await Device.findByIdAndUpdate(
            deviceId,
            { category },
            { new: true }
        );
        
        if (!updatedDevice) {
            return res.status(404).json({ error: 'Device not found' });
        }
        
        res.status(200).json(updatedDevice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a category (updates all devices in that category)
exports.updateCategory = async (req, res) => {
    try {
        const { oldCategory, newCategory } = req.body;
        
        if (!oldCategory || !newCategory) {
            return res.status(400).json({ error: 'Old category and new category are required' });
        }
        
        const result = await Device.updateMany(
            { category: oldCategory },
            { category: newCategory }
        );
        
        res.status(200).json({ 
            message: `Updated ${result.modifiedCount} devices from category "${oldCategory}" to "${newCategory}"`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a category (removes the category from all devices)
exports.deleteCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }
        
        const result = await Device.updateMany(
            { category },
            { category: 'Uncategorized' } 
        );
        
        res.status(200).json({ 
            message: `Removed category "${category}" from ${result.modifiedCount} devices`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all devices in a specific category
exports.getDevicesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }
        
        const devices = await Device.find({ category });
        
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};