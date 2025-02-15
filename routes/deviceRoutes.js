const express = require('express');
const deviceController = require('../controllers/deviceController');

const router = express.Router();

// CRUD routes for devices
router.post('/devices', deviceController.createDevice);
router.get('/devices', deviceController.getDevices);
router.get('/devices/:id', deviceController.getDeviceById);
router.get('/devices/category/:category', deviceController.getDeviceByCategory);
router.patch('/devices/:id', deviceController.updateDevice);
router.delete('/devices/:id', deviceController.deleteDevice);

module.exports = router;
