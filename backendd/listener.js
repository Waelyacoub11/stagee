// listener.js
const { Client } = require('pg');
const io = require('./server');
const pools = require('./config/config');  // Adapte le chemin si nécessaire

// Fonction pour configurer le LISTEN pour une base donnée
function setupListener(pool, dbName) {
    const listenerClient = new Client(pool.options);

    listenerClient.connect()
        .then(() => {
            console.log(`🔗 Connecté à la base ${dbName} pour l'écoute des notifications.`);
            return listenerClient.query('LISTEN new_error_inserted');
        })
        .then(() => listenerClient.query('LISTEN new_error_inserted')) // Si tu as aussi des avertissements
        .catch((err) => {
            console.error(`❌ Erreur lors de l'initialisation de l'écoute pour ${dbName} :`, err.message);
        });

    // Gérer les notifications
    listenerClient.on('notification', (msg) => {
        try {
            const payload = JSON.parse(msg.payload);

            let typeMessage = msg.channel === 'new_warning_inserted'
                ? '🟡 Nouvel avertissement'
                : '🔴 Nouvelle erreur';

            console.log(`${typeMessage} reçue depuis ${dbName}:`, payload);

            // Envoie via WebSocket avec indication de la base
            io.emit('nouvelle-alerte', {
                message: `${typeMessage} sur l'équipement depuis ${dbName}`,
                source: dbName,
                ...payload
            });

            console.log(`✅ Fournisseur notifié depuis ${dbName}.`);

        } catch (err) {
            console.error(`❌ Erreur dans le traitement de la notification pour ${dbName}:`, err.message);
        }
    });
}

// Boucle sur chaque base pour configurer le listener
Object.entries(pools).forEach(([dbName, pool]) => {
    setupListener(pool, dbName);
});
