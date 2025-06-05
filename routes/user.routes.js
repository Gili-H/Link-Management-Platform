const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');


router.post('/', userController.createUser); // Create a new user
router.get('/', userController.getAllUsers); // Get all users
router.get('/:id', userController.getUserById); // Get user by ID
router.put('/:id', userController.updateUser); // Update a user
router.delete('/:id', userController.deleteUser); // Delete a user

module.exports = router;