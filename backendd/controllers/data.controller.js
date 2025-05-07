const { poolAuth } = require('../config/authconfig');
const pools = require('../config/config');

class DataController {
    async getData(req, res) {
        try {
            const { database } = req.query;
            const { technoFilter } = req;
            
            // Vérifier si l'utilisateur a accès à la base demandée
            if (technoFilter !== 'all' && technoFilter !== database) {
                return res.status(403).json({ 
                    message: 'Vous n\'avez pas accès à cette base de données' 
                });
            }
            
            // Si l'utilisateur est globaladmin et qu'aucune base n'est spécifiée, retourner toutes les données
            if (technoFilter === 'all' && !database) {
                const techno1Data = await pools.techno1.query('SELECT * FROM your_table');
                const techno2Data = await pools.techno2.query('SELECT * FROM your_table');
                
                return res.json({
                    techno1: techno1Data.rows,
                    techno2: techno2Data.rows
                });
            }
            
            // Sinon, retourner uniquement les données de la base spécifiée
            const pool = pools[database];
            if (!pool) {
                return res.status(400).json({ message: 'Base de données non trouvée' });
            }
            
            const result = await pool.query('SELECT * FROM your_table');
            res.json(result.rows);
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    }
    
    async getTicketCount(req, res) {
        try {
            const { database } = req.query;
            const { technoFilter } = req;
            
            // Vérifier si l'utilisateur a accès à la base demandée
            if (technoFilter !== 'all' && technoFilter !== database) {
                return res.status(403).json({ 
                    message: 'Vous n\'avez pas accès à cette base de données' 
                });
            }
            
            // Si l'utilisateur est globaladmin et qu'aucune base n'est spécifiée, retourner le nombre total de tickets
            if (technoFilter === 'all' && !database) {
                const techno1Result = await pools.techno1.query('SELECT COUNT(*) FROM tickets');
                const techno2Result = await pools.techno2.query('SELECT COUNT(*) FROM tickets');
                
                return res.json({
                    count: parseInt(techno1Result.rows[0].count) + parseInt(techno2Result.rows[0].count)
                });
            }
            
            // Sinon, retourner uniquement le nombre de tickets de la base spécifiée
            const pool = pools[database];
            if (!pool) {
                return res.status(400).json({ message: 'Base de données non trouvée' });
            }
            
            const result = await pool.query('SELECT COUNT(*) FROM tickets');
            res.json({ count: parseInt(result.rows[0].count) });
        } catch (error) {
            console.error('Erreur lors de la récupération du nombre de tickets:', error);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    }
}

module.exports = new DataController(); 