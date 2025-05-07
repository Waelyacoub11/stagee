const { Pool } = require('pg');

// Liste des bases de données des entreprises
const dbConfigs = {
    techno1: {
        user: 'postgres',
        host: 'localhost',
        database: 'techno1',
        password: 'azazaz',
        port: 5433,
        
    },
    techno2: {
        user: 'postgres',
        host: 'localhost',
        database: 'techno2',
        password: 'azazaz',
        port: 5433,
        
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
