const Device = require('../models/deviceModel');

// Function to create a new device
const createDevice = async (deviceData) => {
    const device = new Device(deviceData);
    return await device.save();
};

// Function to get all devices
const getDevices = async () => {
    return await Device.find({});
};

// Function to get a device by ID
const getDeviceById = async (id) => {
    return await Device.findById(id);
};

// Function to get a device by category
const getDeviceByCategory = async (category) => {
    return await Device.find({ category });
};

// Function to update a device by ID
const updateDevice = async (id, updateData) => {
    return await Device.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

// Function to delete a device by ID
const deleteDevice = async (id) => {
    return await Device.findByIdAndDelete(id);
};

module.exports = {
    createDevice,
    getDevices,
    getDeviceById,
    getDeviceByCategory,
    updateDevice,
    deleteDevice
};
