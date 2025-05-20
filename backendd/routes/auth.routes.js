const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const authController = new AuthController();

// Route pour l'inscription
router.post('/register', (req, res) => authController.register(req, res));

// Route pour la connexion
router.post('/login', (req, res) => authController.login(req, res));

// Route pour obtenir les informations de l'utilisateur connecté
router.get('/me', authMiddleware.verifyToken, (req, res) => authController.getCurrentUser(req, res));

module.exports = router;
