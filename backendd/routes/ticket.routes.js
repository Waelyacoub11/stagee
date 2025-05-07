// ticket.routes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");

// Importer la fonction de contrôleur (avec le pool et io)
const ticketController = require("../controllers/ticket.controller");
const pool = require("../config/config");
const io = require("../server"); // Si vous avez une instance de io dans votre serveur
const controller = ticketController(pool, io); // Instancier le contrôleur avec le pool et io

// Récupérer les tickets pour chaque client
router.get("/", verifyToken, (req, res) => {
  controller.getAllTickets(req, res); // Appeler la méthode pour récupérer les tickets
});

router.post("/stat", verifyToken, (req, res) => {
  controller.statTickets(req, res);
});

module.exports = router;
