const express = require('express');
const router = express.Router();
const EquipementController = require('../controllers/equipement.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Créer une instance du contrôleur
const equipementController = new EquipementController();

// Appliquer le middleware d'authentification à toutes les routes
router.use(verifyToken);

// Route pour récupérer tous les équipements
router.get('/', (req, res) => equipementController.getAllEquipements(req, res));

// Route pour récupérer un équipement par modèle
router.get('/modele/:modele', (req, res) => equipementController.getEquipementByModele(req, res));

router.post(
    "/disponibilite",
    (req, res) => equipementController.getEquipementDisponiblesNonDisponibles(req, res)
  );
  
module.exports = router;
