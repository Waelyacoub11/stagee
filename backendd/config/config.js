const { Pool } = require('pg');

// Configuration des clusters Aurora à partir des variables d'environnement
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'azazaz';
const DB_PORT = process.env.DB_PORT || 5432;

// Configuration SSL pour Aurora
const SSL_ENABLED = process.env.SSL_ENABLED === 'true' || true;

// Liste des bases de données des entreprises dans le cluster Aurora
const dbConfigs = {
    techno1: {
        user: DB_USER,
        host: DB_HOST,
        database: 'techno',
        password: DB_PASSWORD,
        port: DB_PORT,
        //ssl: SSL_ENABLED ? { rejectUnauthorized: false } : false,  // SSL config pour Aurora
        //max: 20,  // Paramètres de pool recommandés pour Aurora
        //idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
    },
    techno2: {
        user: DB_USER,
        host: DB_HOST,
        database: 'techno',
        password: DB_PASSWORD,
        port: DB_PORT,
        //ssl: SSL_ENABLED ? { rejectUnauthorized: false } : false,  // SSL config pour Aurora
        //max: 20,
        //idleTimeoutMillis: 30000,
        // connectionTimeoutMillis: 2000
    }
};

// Création de pools de connexions pour chaque base
const pools = {};

Object.keys(dbConfigs).forEach(client => {
    try {
        pools[client] = new Pool(dbConfigs[client]);
        
        // Vérification de la connexion au pool Aurora
        pools[client].connect()
            .then(() => console.log(`Connexion au cluster Aurora réussie pour la base ${client}`))
            .catch((err) => {
                console.error(`Erreur de connexion au cluster Aurora pour ${client}: ${err.message}`);
            });
            
        // Gestion des erreurs de connection
        pools[client].on('error', (err) => {
            console.error(`Erreur de pool Aurora pour ${client}:`, err.message);
            // Tentative de reconnexion après 5 secondes
            setTimeout(() => {
                console.log(`Tentative de reconnexion au cluster Aurora pour ${client}...`);
                pools[client].connect();
            }, 5000);
        });
    } catch (err) {
        console.error(`Erreur lors de la création du pool Aurora pour ${client}: ${err.message}`);
    }
});

module.exports = pools;
