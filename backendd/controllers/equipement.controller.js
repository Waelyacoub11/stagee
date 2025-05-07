// equipement.controller.js
const Equipement = require("../models/equipement.model");
const {
  verifyToken,
  filterDataByRole,
} = require("../middleware/auth.middleware");
const pools = require("../config/config");

class EquipementController {
  constructor(io) {
    // Créer un modèle pour chaque base de données
    this.equipementModels = {
      techno1: new Equipement(pools.techno1, io),
      techno2: new Equipement(pools.techno2, io),
    };
  }

  async getAllEquipements(req, res) {
    try {
      let result = {};

      // Récupérer les données selon le rôle de l'utilisateur
      if (req.user.role === "globaladmin") {
        // Le globaladmin voit tout
        const [techno1Data, techno2Data] = await Promise.all([
          this.equipementModels.techno1.getAllEquipements(),
          this.equipementModels.techno2.getAllEquipements(),
        ]);
        result = {
          techno1: techno1Data,
          techno2: techno2Data,
        };
      } else if (req.user.role === "superadmin1") {
        // superadmin1 ne voit que techno1
        result.techno1 =
          await this.equipementModels.techno1.getAllEquipements();
      } else if (req.user.role === "superadmin2") {
        // superadmin2 ne voit que techno2
        result.techno2 =
          await this.equipementModels.techno2.getAllEquipements();
      }

      res.json(result);
    } catch (err) {
      console.error("Erreur lors de la récupération des équipements:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  async getEquipementByModele(req, res) {
    try {
      const { modele } = req.params;
      let result = {};

      // Récupérer les données selon le rôle de l'utilisateur
      if (req.user.role === "globaladmin") {
        // Le globaladmin voit tout
        const [techno1Data, techno2Data] = await Promise.all([
          this.equipementModels.techno1.getEquipementByModele(modele),
          this.equipementModels.techno2.getEquipementByModele(modele),
        ]);
        result = {
          techno1: techno1Data,
          techno2: techno2Data,
        };
      } else if (req.user.role === "superadmin1") {
        // superadmin1 ne voit que techno1
        result.techno1 =
          await this.equipementModels.techno1.getEquipementByModele(modele);
      } else if (req.user.role === "superadmin2") {
        // superadmin2 ne voit que techno2
        result.techno2 =
          await this.equipementModels.techno2.getEquipementByModele(modele);
      }

      res.json(result);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'équipement:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

 async getEquipementDisponiblesNonDisponibles(req, res) {
  try {
    const selectedBase = req.body.selectedBase;

    const techno1Equipements = selectedBase === 'techno1' || !selectedBase
      ? await this.equipementModels.techno1.getAllEquipements()
      : [];
    const techno2Equipements = selectedBase === 'techno2' || !selectedBase
      ? await this.equipementModels.techno2.getAllEquipements()
      : [];

    const disponiblesTechno1 = techno1Equipements.filter(
      (equipement) =>
        equipement.disponibilite !== "maintenance" &&
        equipement.disponibilite !== null &&
        equipement.disponibilite !== "null"
    );
    const nonDisponiblesTechno1 = techno1Equipements.filter(
      (equipement) =>
        equipement.disponibilite == false || equipement.disponibilite == null
    );

    const disponiblesTechno2 = techno2Equipements.filter(
      (equipement) =>
        equipement.disponibilite !== "maintenance" &&
        equipement.disponibilite !== null &&
        equipement.disponibilite !== "null"
    );
    const nonDisponiblesTechno2 = techno2Equipements.filter(
      (equipement) =>
        equipement.disponibilite == false || equipement.disponibilite == null
    );

    const role = req.user.role;

    if (role === "globaladmin") {
      let result = {};
      if (selectedBase === "techno1") {
        result.techno1 = {
          disponibles: disponiblesTechno1,
          nonDisponibles: nonDisponiblesTechno1,
        };
      } else if (selectedBase === "techno2") {
        result.techno2 = {
          disponibles: disponiblesTechno2,
          nonDisponibles: nonDisponiblesTechno2,
        };
      } else {
        result = {
          techno1: {
            disponibles: disponiblesTechno1,
            nonDisponibles: nonDisponiblesTechno1,
          },
          techno2: {
            disponibles: disponiblesTechno2,
            nonDisponibles: nonDisponiblesTechno2,
          },
        };
      }
      return res.status(200).json(result);
    } else if (role === "superadmin1") {
      return res.status(200).json({
        techno1: {
          disponibles: disponiblesTechno1,
          nonDisponibles: nonDisponiblesTechno1,
        },
      });
    } else if (role === "superadmin2") {
      return res.status(200).json({
        techno2: {
          disponibles: disponiblesTechno2,
          nonDisponibles: nonDisponiblesTechno2,
        },
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des équipements : ", error.message);
    res.status(500).json({ error: error.message });
  }
}

  
}

module.exports = EquipementController;
