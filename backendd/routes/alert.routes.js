const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const { verifyToken } = require('../middleware/auth.middleware');
console.log("Le fichier alert.routes.js est chargé");

// Route pour récupérer toutes les alertes
router.get('/', verifyToken, alertController.getAllAlerts);

// Route pour récupérer les alertes par statut
router.get('/status/:status', verifyToken, alertController.getAlertsByStatus);
router.post('/statut', verifyToken, alertController.statAlertsByStatut);

module.exports = router;
