// action.router.js
const express = require('express');
const router = express.Router();
const actionController = require('../controllers/action.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Définir une route pour récupérer les équipements et leurs commandes associées
router.get('/', verifyToken, actionController.getAllActions);
router.post('/stat', verifyToken, actionController.statActionByType);

module.exports = router;
