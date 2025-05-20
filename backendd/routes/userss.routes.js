const express = require('express');
const router = express.Router();
const userssController = require('../controllers/userss.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Route pour récupérer tous les utilisateurs
router.get('/', userssController.getAllUserss);

// Route pour récupérer un utilisateur par son ID
router.get('/:id', userssController.getUserssById);

// Route pour récupérer les utilisateurs par rôle
router.post('/role', verifyToken, userssController.getUserssByRole);

module.exports = router;