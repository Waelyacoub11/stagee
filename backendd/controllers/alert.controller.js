const Alert = require("../models/alert.model");
const pools = require("../config/config");

const alertController = {
  async getAllAlerts(req, res) {
    try {
      console.log("Requête reçue pour récupérer toutes les alertes");

      let allAlerts = {};

      if (req.user.role === "globaladmin") {
        // Le globaladmin voit toutes les alertes
        for (const client in pools) {
          const pool = pools[client];
          const alert = new Alert(pool);
          await alert.deleteOldAlertsForHealthyEquipments();
          const alerts = await alert.getAllAlerts();
          allAlerts[client] = alerts;
        }
      } else if (req.user.role === "superadmin1") {
        // superadmin1 ne voit que les alertes de techno1
        const alert = new Alert(pools.techno1);
        await alert.deleteOldAlertsForHealthyEquipments();
        allAlerts.techno1 = await alert.getAllAlerts();
      } else if (req.user.role === "superadmin2") {
        // superadmin2 ne voit que les alertes de techno2
        const alert = new Alert(pools.techno2);
        await alert.deleteOldAlertsForHealthyEquipments();
        allAlerts.techno2 = await alert.getAllAlerts();
      }

      res.status(200).json(allAlerts); // Réponse JSON avec toutes les alertes
    } catch (err) {
      console.error("Erreur lors de la récupération des alertes :", err);
      res.status(500).json({ error: "Impossible de récupérer les alertes." });
    }
  },

  async getAlertsByStatus(req, res) {
    try {
      const { status } = req.params; // Extraire le statut de l'alerte (erreur ou avertissement)
      console.log(`Recherche des alertes avec le statut : ${status}`);

      let allAlertsByStatus = {};

      if (req.user.role === "globaladmin") {
        // Le globaladmin voit toutes les alertes
        for (const client in pools) {
          const pool = pools[client];
          const alert = new Alert(pool);
          await alert.deleteOldAlertsForHealthyEquipments();
          const alertsData = await alert.getAlertsByStatus(status);
          allAlertsByStatus[client] = alertsData || [];
        }
      } else if (req.user.role === "superadmin1") {
        // superadmin1 ne voit que les alertes de techno1
        const alert = new Alert(pools.techno1);
        await alert.deleteOldAlertsForHealthyEquipments();
        const alertsData = await alert.getAlertsByStatus(status);
        allAlertsByStatus.techno1 = alertsData || [];
      } else if (req.user.role === "superadmin2") {
        // superadmin2 ne voit que les alertes de techno2
        const alert = new Alert(pools.techno2);
        await alert.deleteOldAlertsForHealthyEquipments();
        const alertsData = await alert.getAlertsByStatus(status);
        allAlertsByStatus.techno2 = alertsData || [];
      }

      if (Object.keys(allAlertsByStatus).length > 0) {
        res.status(200).json(allAlertsByStatus);
      } else {
        res
          .status(404)
          .json({ error: `Aucune alerte trouvée avec le statut ${status}.` });
      }
    } catch (err) {
      console.error(
        "Erreur lors de la récupération des alertes par statut :",
        err
      );
      res.status(500).json({
        error: `Impossible de récupérer les alertes avec le statut ${err}.`,
      });
    }
  },

  async statAlertsByStatut(req, res) {
    try {
      let allAlerts = {};
  
      // Applique le même filtrage basé sur le rôle que dans les autres fonctions
      if (req.user.role === "globaladmin") {
        // Le globaladmin voit toutes les alertes
        for (const client in pools) {
          const pool = pools[client];
          const alert = new Alert(pool);
          await alert.deleteOldAlertsForHealthyEquipments();
          const alerts = await alert.getAllAlerts();
          allAlerts[client] = alerts;
        }
      } else if (req.user.role === "superadmin1") {
        // superadmin1 ne voit que les alertes de techno1
        const alert = new Alert(pools.techno1);
        await alert.deleteOldAlertsForHealthyEquipments();
        allAlerts.techno1 = await alert.getAllAlerts();
      } else if (req.user.role === "superadmin2") {
        // superadmin2 ne voit que les alertes de techno2
        const alert = new Alert(pools.techno2);
        await alert.deleteOldAlertsForHealthyEquipments();
        allAlerts.techno2 = await alert.getAllAlerts();
      }
      
      // Aplatir uniquement les alertes autorisées pour cet utilisateur
      const mergedAlerts = Object.values(allAlerts).flat();
  
      const erreurs = mergedAlerts.filter((alert) => alert.statut === "erreur");
      const avertissements = mergedAlerts.filter(
        (alert) => alert.statut === "avertissement"
      );
  
      res.status(200).json({
        erreurs: erreurs,
        avertissements: avertissements,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des alertes : ",
        error.message
      );
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = alertController;