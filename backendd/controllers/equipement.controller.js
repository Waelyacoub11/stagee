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
      const selectedCompany = req.body.selectedCompany;

      if (req.user.role === "globaladmin" && selectedCompany) {
        const equipements = await this.equipementModels[selectedCompany].getAllEquipements();
        
        // Filtrer en utilisant des valeurs booléennes (true/false)
        const disponibles = equipements.filter(e => e.disponibilite === true);
        const nonDisponibles = equipements.filter(e => e.disponibilite === false || e.disponibilite === null);
        
        console.log(`${selectedCompany} - Total: ${equipements.length}, Disponibles: ${disponibles.length}, Non disponibles: ${nonDisponibles.length}`);
        
        return res.json({
          [selectedCompany]: {
            disponibles: disponibles,
            nonDisponibles: nonDisponibles
          }
        });
      }

      const techno1Equipements = selectedBase === 'techno1' || !selectedBase
        ? await this.equipementModels.techno1.getAllEquipements()
        : [];
      const techno2Equipements = selectedBase === 'techno2' || !selectedBase
        ? await this.equipementModels.techno2.getAllEquipements()
        : [];
      
      // Transformer les données pour s'assurer que disponibilite est un booléen
      const transformEquipements = (equipements) => {
        return equipements.map(equip => ({
          ...equip,
          disponibilite: equip.disponibilite === true || equip.disponibilite === 'true' || equip.disponibilite === 1 || equip.disponibilite === '1'
        }));
      };

      // Appliquer la transformation
      const transformedTechno1 = transformEquipements(techno1Equipements);
      const transformedTechno2 = transformEquipements(techno2Equipements);
      
      console.log('Données transformées de techno1:', JSON.stringify(transformedTechno1, null, 2));
      console.log('Données transformées de techno2:', JSON.stringify(transformedTechno2, null, 2));

      // Afficher les valeurs de disponibilité pour comprendre le problème
      console.log("Valeurs de disponibilité dans techno1:", techno1Equipements.map(e => e.disponibilite));
      console.log("Valeurs de disponibilité dans techno2:", techno2Equipements.map(e => e.disponibilite));
      
      // Vérifier le type de données de disponibilité
      if (techno1Equipements.length > 0) {
        console.log("Type de disponibilité dans techno1:", typeof techno1Equipements[0].disponibilite);
      }
      if (techno2Equipements.length > 0) {
        console.log("Type de disponibilité dans techno2:", typeof techno2Equipements[0].disponibilite);
      }

      // Utiliser les données transformées pour le filtrage
      // Pour techno1
      const disponiblesTechno1 = transformedTechno1.filter(
        (equipement) => equipement.disponibilite === true
      );
      const nonDisponiblesTechno1 = transformedTechno1.filter(
        (equipement) => equipement.disponibilite === false
      );

      // Pour techno2
      const disponiblesTechno2 = transformedTechno2.filter(
        (equipement) => equipement.disponibilite === true
      );
      const nonDisponiblesTechno2 = transformedTechno2.filter(
        (equipement) => equipement.disponibilite === false
      );
      
      console.log('techno1 - Disponibles:', disponiblesTechno1.length, 'Non disponibles:', nonDisponiblesTechno1.length);
      console.log('techno2 - Disponibles:', disponiblesTechno2.length, 'Non disponibles:', nonDisponiblesTechno2.length);
      
      // Afficher les résultats du filtrage
      console.log("Disponibles techno1:", disponiblesTechno1.map(e => e.modele));
      console.log("Non disponibles techno1:", nonDisponiblesTechno1.map(e => e.modele));
      
      // Ajouter des logs pour le débogage
      console.log(`Techno1 - Total: ${techno1Equipements.length}, Disponibles: ${disponiblesTechno1.length}, Non disponibles: ${nonDisponiblesTechno1.length}`);
      console.log(`Techno2 - Total: ${techno2Equipements.length}, Disponibles: ${disponiblesTechno2.length}, Non disponibles: ${nonDisponiblesTechno2.length}`);
      
      // Vérifier si les données sont identiques dans les deux bases
      const techno1Json = JSON.stringify(techno1Equipements);
      const techno2Json = JSON.stringify(techno2Equipements);
      const dataIdentical = techno1Json === techno2Json;
      
      if (dataIdentical) {
        console.log("ATTENTION: Les données de techno1 et techno2 sont identiques!");
      }

    const role = req.user.role;

    if (role === "globaladmin") {
      let result = {};
      if (selectedBase === "techno1") {
        // Format correct pour le frontendm
        result.techno1 = {
          disponibles: disponiblesTechno1,
          nonDisponibles: nonDisponiblesTechno1,
        };
        console.log("Résultat pour techno1:", result);
      } else if (selectedBase === "techno2") {
        // Format correct pour le frontend
        result.techno2 = {
          disponibles: disponiblesTechno2,
          nonDisponibles: nonDisponiblesTechno2,
        };
        console.log("Résultat pour techno2:", result);
      } else {
        // Format correct pour le frontend
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
        console.log("Résultat pour les deux bases:", result);
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
