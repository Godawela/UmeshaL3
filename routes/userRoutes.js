const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/users', userController.createUser);
router.get('/users', userController.getAllUsers);
router.put('/users/:uid', userController.updateUser);
router.get('/users/:uid', userController.getUserByUid);

module.exports = router;
