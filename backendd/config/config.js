const { Pool } = require('pg');

// Configuration de la base de données à partir des variables d'environnement
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'azazaz';
const DB_PORT = process.env.DB_PORT || 5432;

// Liste des bases de données des entreprises
const dbConfigs = {
    techno1: {
        user: DB_USER,
        host: DB_HOST,
        database: 'techno1',
        password: DB_PASSWORD,
        port: DB_PORT,
    },
    techno2: {
        user: DB_USER,
        host: DB_HOST,
        database: 'techno2',
        password: DB_PASSWORD,
        port: DB_PORT,
    }
};

// Création de pools de connexions pour chaque base
const pools = {};

Object.keys(dbConfigs).forEach(client => {
    try {
        pools[client] = new Pool(dbConfigs[client]);
        
        // Vérification de la connexion au pool
        pools[client].connect()
            .then(() => console.log(`Connexion réussie pour ${client}`))
            .catch((err) => {
                console.error(`Erreur de connexion pour ${client}: ${err.message}`);
            });
    } catch (err) {
        console.error(`Erreur lors de la création du pool pour ${client}: ${err.message}`);
    }
});

module.exports = pools;
