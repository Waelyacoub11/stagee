const express = require('express');
const router = express.Router();
const dataController = require('../controllers/data.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Route protégée qui utilise le filtre par rôle
router.get('/data', 
    authMiddleware.verifyToken, 
    authMiddleware.filterDataByRole,
    (req, res) => dataController.getData(req, res)
);

module.exports = router; 