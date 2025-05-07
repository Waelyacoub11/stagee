// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Route pour récupérer tous les utilisateurs
router.get('/', userController.getAllUsers);



// Route pour récupérer un utilisateur par son ID
router.get('/:id', userController.getUserById);

module.exports = router;
