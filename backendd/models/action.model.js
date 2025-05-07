// action.model.js
class ActionModel {
  constructor(pool, io) {
      this.pool = pool;  // Connexion à la base de données
      this.io = io;      // WebSocket, utilisé si nécessaire pour la gestion en temps réel
  }

  // Méthode pour récupérer toutes les actions sans filtrage
  async getAllActions() {
      try {
          console.log('Connexion à la base de données...');
          // Test simple pour vérifier la connexion
          await this.pool.query('SELECT NOW()');
          console.log('Connexion réussie !');
          
          // Exécuter la requête pour récupérer toutes les actions avec les informations de l'équipement et de l'imprimante
          const result = await this.pool.query(`
              SELECT 
                  a.*,
                  e.ipadresse,
                  i.serialnumber
              FROM action a
              LEFT JOIN equipement e ON a.idequipement = e.idequipement
              LEFT JOIN imprimante i ON e.idequipement = i.idequipement
          `);
          return result.rows;
      } catch (err) {
          console.error("Erreur lors de la récupération des actions :", err);
          throw new Error("Impossible de récupérer les actions.");
      }
  }
}

module.exports = ActionModel;
