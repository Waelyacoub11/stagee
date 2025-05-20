const ActionModel = require("../models/action.model");
const pools = require("../config/config");

const actionController = {
  // Méthode pour récupérer toutes les actions
  async getAllActions(req, res) {
    try {
      console.log("🔍 Récupération des actions...");
      let allActions = {};

      if (req.user.role === "globaladmin") {
        // Le globaladmin voit toutes les actions
        for (const client in pools) {
          try {
            const actionModel = new ActionModel(pools[client]);
            const result = await actionModel.getAllActions();
            allActions[client] = result;
          } catch (error) {
            console.error(
              `❌ Erreur lors de la récupération des actions pour ${client}:`,
              error
            );
            allActions[client] = [];
          }
        }
      } else if (req.user.role === "superadmin1") {
        // superadmin1 ne voit que les actions de techno1
        try {
          const actionModel = new ActionModel(pools.techno1);
          allActions.techno1 = await actionModel.getAllActions();
        } catch (error) {
          console.error(
            "❌ Erreur lors de la récupération des actions pour techno1:",
            error
          );
          allActions.techno1 = [];
        }
      } else if (req.user.role === "superadmin2") {
        // superadmin2 ne voit que les actions de techno2
        try {
          const actionModel = new ActionModel(pools.techno2);
          allActions.techno2 = await actionModel.getAllActions();
        } catch (error) {
          console.error(
            "❌ Erreur lors de la récupération des actions pour techno2:",
            error
          );
          allActions.techno2 = [];
        }
      }

      res.status(200).json(allActions);
    } catch (err) {
      console.error("❌ Erreur lors de la récupération des actions :", err);
      res.status(500).json({ error: "Impossible de récupérer les actions." });
    }
  },
  async statActionByType(req, res) {
    try {
      console.log(" Calcul des statistiques des actions par type...");
      const selectedBase = req.body.selectedBase;
      const role = req.user.role;

      let statsByType = {};
      let totalStats = {
        CONTRAST_CHANGE: 0,
        IP_CHANGE: 0,
        SPEED_CHANGE: 0,
        CUSTOM_COMMAND: 0,
      };

      const calculateStats = (actions) => {
        return actions.reduce(
          (acc, action) => {
            const command_type = action.command_type || "OTHER";
            acc[command_type] = (acc[command_type] || 0) + 1;
            return acc;
          },
          {
            CONTRAST_CHANGE: 0,
            IP_CHANGE: 0,
            SPEED_CHANGE: 0,
            CUSTOM_COMMAND: 0,
          }
        );
      };

      if (role === "globaladmin" && selectedBase) {
        try {
          const actionModel = new ActionModel(pools[selectedBase]);
          const actions = await actionModel.getAllActions();
          statsByType[selectedBase] = calculateStats(actions);
          return res.status(200).json({
            message: "Statistiques récupérées",
            data: statsByType
          });
        } catch (error) {
          console.error(` Erreur pour ${selectedBase}:`, error);
          statsByType[selectedBase] = {};
          return res.status(200).json({
            message: "Statistiques récupérées",
            data: statsByType
          });
        }
      }

      if (role === "globaladmin") {
        for (const client in pools) {
          try {
            const actionModel = new ActionModel(pools[client]);
            const actions = await actionModel.getAllActions();

            statsByType[client] = calculateStats(actions);

            for (const key in statsByType[client]) {
              totalStats[key] += statsByType[client][key];
            }
          } catch (error) {
            console.error(` Erreur pour ${client}:`, error);
            statsByType[client] = {};
          }
        }
      } else if (role === "superadmin1") {
        try {
          const actionModel = new ActionModel(pools.techno1);
          const actions = await actionModel.getAllActions();
          statsByType.techno1 = calculateStats(actions);

          // Pour superadmin1, on ne calcule les totaux que pour techno1
          for (const key in statsByType.techno1) {
            totalStats[key] = statsByType.techno1[key];
          }
        } catch (error) {
          console.error(" Erreur pour techno1:", error);
          statsByType.techno1 = {};
        }
      } else if (role === "superadmin2") {
        try {
          const actionModel = new ActionModel(pools.techno2);
          const actions = await actionModel.getAllActions();
          statsByType.techno2 = calculateStats(actions);

          // Pour superadmin2, on ne calcule les totaux que pour techno2
          for (const key in statsByType.techno2) {
            totalStats[key] = statsByType.techno2[key];
          }
        } catch (error) {
          console.error(" Erreur pour techno2:", error);
          statsByType.techno2 = {};
        }
      }

      // Combine les statistiques de techno1 et techno2 dans totalStats
      statsByType.tot = totalStats;

      res.status(200).json({
        message: "Statistiques récupérées",
        data: statsByType
      });
    } catch (err) {
      console.error("❌ Erreur globale :", err);
      res
        .status(500)
        .json({ error: "Erreur lors du calcul des statistiques." });
    }
  },
};

module.exports = actionController;
