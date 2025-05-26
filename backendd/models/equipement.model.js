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
            
            // Récupérer tous les PDAs
            const pdasResult = await this.pool.query('SELECT id, modele, serialnumber FROM pda');
            const pdas = pdasResult.rows;
            console.log(`PDAs récupérés: ${pdas.length}`);
            
            // Exécuter la requête pour récupérer les équipements sans jointure PDA
            const result = await this.pool.query(`
                SELECT 
                    e.modele,
                    e.ipadresse,
                    e.disponibilite,
                    i.serialnumber AS imprimante_serialnumber,
                    i.contrast, 
                    i.typeimpression,
                    i.vitesse,
                    p.nomparc
                FROM equipement e
                LEFT JOIN imprimante i ON e.idequipement = i.idequipement
                LEFT JOIN parc p ON e.idparc = p.idparc
                ORDER BY e.idequipement DESC
            `);
            
            // Associer manuellement les PDAs aux équipements
            const transformedRows = result.rows.map(equipment => {
                // Rechercher un PDA correspondant au modèle
                const matchingPda = pdas.find(pda => 
                    pda.modele && equipment.modele && 
                    pda.modele.trim().toLowerCase() === equipment.modele.trim().toLowerCase()
                );
                
                return {
                    ...equipment,
                    pda_serialnumber: matchingPda ? matchingPda.serialnumber : null,
                    serialnumber: matchingPda ? matchingPda.serialnumber : equipment.imprimante_serialnumber || 'N/A'
                };
            });
            
            return transformedRows;  // Retourner les résultats transformés
        } catch (err) {
            console.error("Erreur lors de la récupération des équipements :", err);
            throw new Error("Impossible de récupérer les équipements.");
        }
    }

    async getEquipementByModele(modele) {
        try {
            console.log(`📡 Requête SQL en cours pour le modèle : ${modele}`);

            // Récupérer tous les PDAs
            const pdasResult = await this.pool.query('SELECT id, modele, serialnumber FROM pda');
            const pdas = pdasResult.rows;
            console.log(`PDAs récupérés: ${pdas.length}`);
            
            // Requête SQL pour récupérer les équipements sans jointure PDA
            const query = `
                SELECT 
                    e.modele,
                    e.ipadresse,
                    e.disponibilite,
                    i.serialnumber AS imprimante_serialnumber,
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
            
            // Associer manuellement les PDAs aux équipements
            const transformedRows = result.rows.map(equipment => {
                // Rechercher un PDA correspondant au modèle
                const matchingPda = pdas.find(pda => 
                    pda.modele && equipment.modele && 
                    pda.modele.trim().toLowerCase() === equipment.modele.trim().toLowerCase()
                );
                
                return {
                    ...equipment,
                    pda_serialnumber: matchingPda ? matchingPda.serialnumber : null,
                    serialnumber: matchingPda ? matchingPda.serialnumber : equipment.imprimante_serialnumber || 'N/A'
                };
            });

            console.log(`✅ Résultat trouvé : ${transformedRows.length} équipements`);
            return transformedRows;  // Retourner les résultats transformés
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
