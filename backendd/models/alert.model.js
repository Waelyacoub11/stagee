class Alert {
    constructor(pool, io) {
        this.pool = pool;
        this.io = io; // WebSocket pour la gestion en temps réel
    }

    // Récupérer toutes les alertes avec un statut spécifique
    async getAllAlerts(status) {
        try {
            console.log('Connexion à la base de données...');
            await this.pool.query('SELECT NOW()');
            console.log('Connexion réussie !');
    
            // Jointure pour récupérer l'alerte + l'Adresse_IP et le modèle de l'équipement
            const query = `
                SELECT i.*, e."ipadresse", e.modele 
                FROM information i
                JOIN equipement e ON i.idequipement = e.idequipement;
            `;
    
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            console.error("Erreur lors de la récupération des alertes:", error);
            throw new Error("Impossible de récupérer les alertes.");
        }
    }
    
    // Méthode pour récupérer les alertes d'un type de statut particulier (erreur ou avertissement)
    async getAlertsByStatus(status) {
        try {
            const query = "SELECT * FROM information WHERE statut = $1 ORDER BY timestamp DESC";
            const result = await this.pool.query(query, [status]);
            return result.rows;
        } catch (error) {
            console.error("Erreur lors de la récupération des alertes:", error);
            throw new Error("Impossible de récupérer les alertes par statut.");
        }
    }

    async deleteOldAlertsForHealthyEquipments() {
        const query = `
          DELETE FROM information i
          WHERE i.statut IN ('erreur', 'avertissement')
          AND EXISTS (
            SELECT 1
            FROM (
              SELECT idequipement, MAX(date) as last_date
              FROM information
              WHERE statut NOT IN ('erreur', 'avertissement')
              GROUP BY idequipement
            ) AS last_ok
            WHERE last_ok.idequipement = i.idequipement
            AND i.date < last_ok.last_date
          );
        `;
        const result = await this.pool.query(query);
        console.log(`✅ Suppression intelligente : ${result.rowCount} alertes nettoyées`);
    }
}

module.exports = Alert;
