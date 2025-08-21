const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/users', userController.createUser);
router.get('/users', userController.getAllUsers);
router.put('/users/:uid', userController.updateUser);
router.get('/users/:uid', userController.getUserByUid);
router.get('/users/:uid/role', userController.getUserRoleByUid);
router.get('/users/verify/:uid/:token', userController.verifyUser);
router.delete('/users/:uid', userController.deleteUser);


module.exports = router;
