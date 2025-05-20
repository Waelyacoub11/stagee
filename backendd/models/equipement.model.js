// equipement.model.js
class Equipement {
    constructor(pool, io) {
        this.pool = pool;  // Connexion à la base de données
        this.io = io;      // WebSocket, utilisé si nécessaire pour la gestion en temps réel
    }

    // Méthode pour récupérer tous les équipements sans filtrage
    async getAllEquipements() {
        try {
            console.log('Connexion à la base de données...');
            // Test simple pour vérifier la connexion
            await this.pool.query('SELECT NOW()');
            console.log('Connexion réussie !');
            
            // Exécuter la requête pour récupérer tous les équipements avec jointure
            const result = await this.pool.query(`
                SELECT 
                    e.modele,
                    e.ipadresse,
                    e.disponibilite,
                    i.serialnumber,
                    i.contrast, 
                    i.typeimpression,
                    i.vitesse,
                    p.nomparc
                FROM equipement e
                LEFT JOIN imprimante i ON e.idequipement = i.idequipement
                LEFT JOIN parc p ON e.idparc = p.idparc
                ORDER BY e.idequipement DESC
            `);
            return result.rows;  // Retourner les résultats de la base de données
        } catch (err) {
            console.error("Erreur lors de la récupération des équipements :", err);
            throw new Error("Impossible de récupérer les équipements.");
        }
    }

    async getEquipementByModele(modele) {
        try {
            console.log(`📡 Requête SQL en cours pour le modèle : ${modele}`);

            // Requête SQL pour récupérer les équipements ayant le modèle spécifié avec jointure
            const query = `
                SELECT 
                    e.modele,
                    e.ipadresse,
                    e.disponibilite,
                    i.serialnumber,
                    i.contrast,
                    i.typeimpression,
                    i.vitesse,
                    p.nomparc
                FROM equipement e
                LEFT JOIN imprimante i ON e.idequipement = i.idequipement
                LEFT JOIN parc p ON e.idparc = p.idparc
                WHERE e.modele = $1
                ORDER BY e.idequipement DESC
            `;
            const result = await this.pool.query(query, [modele]);

            console.log(`✅ Résultat trouvé : ${result.rows.length} équipements`);
            return result.rows;  // Retourner les résultats
        } catch (err) {
            console.error("❌ Erreur lors de la récupération de l'équipement :", err);
            throw new Error("Impossible de récupérer l'équipement.");
        }
    }

    async executeQuery(query) {
        try {
          const result = await this.pool.query(query);
          return result.rows;
        } catch (error) {
          console.error('Erreur dans executeQuery :', error.message);
          throw error;
        }
      }
}

module.exports = Equipement;
