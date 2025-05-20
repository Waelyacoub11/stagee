const pools = require('../config/config');

class Userss {
    // Récupérer tous les utilisateurs des deux bases
    static async getAll() {
        try {
            // Récupérer les utilisateurs de la première base
            const client1 = await pools.techno1.connect();
            const result1 = await client1.query('SELECT * FROM users');
            client1.release();

            // Récupérer les utilisateurs de la deuxième base
            const client2 = await pools.techno2.connect();
            const result2 = await client2.query('SELECT * FROM users');
            client2.release();

            // Retourner les résultats groupés par base de données
            return {
                techno1: result1.rows,
                techno2: result2.rows
            };
        } catch (error) {
            console.error('Erreur dans le modèle Userss.getAll:', error);
            throw error;
        }
    }

    // Récupérer un utilisateur par ID
    static async getById(id) {
        try {
            // Chercher dans la première base
            const client1 = await pools.techno1.connect();
            const result1 = await client1.query('SELECT * FROM users WHERE id = $1', [id]);
            client1.release();

            if (result1.rows.length > 0) {
                return {
                    ...result1.rows[0],
                    db_origin: 'techno1'
                };
            }


            // Si pas trouvé dans la première base, chercher dans la deuxième
            const client2 = await pools.techno2.connect();
            const result2 = await client2.query('SELECT * FROM users WHERE id = $1', [id]);
            client2.release();

            if (result2.rows.length > 0) {
                return {
                    ...result2.rows[0],
                    db_origin: 'techno2'
                };
            }

            return null;
        } catch (error) {
            console.error('Erreur dans le modèle Userss.getById:', error);
            throw error;
        }
    }
}

module.exports = Userss;