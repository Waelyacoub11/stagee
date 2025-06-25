require('dotenv').config();

const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors'); // ✅ Import de CORS
const { Server } = require('socket.io');
const equipementRouter = require('./routes/equipement.routes');
const ticketRouter = require('./routes/ticket.routes');
const actionRouter = require('./routes/action.routes');
const userRouter = require('./routes/user.routes');
const userssRouter = require('./routes/userss.routes');
const alertRouter = require('./routes/alert.routes');
const pool = require('./config/config'); // Assure-toi que pool est bien défini

// Fonction pour réactiver les triggers toutes les secondes
function reactivateTriggersEverySecond() {
  setInterval(async () => {
    const clients = Object.keys(pool);
    for (const client of clients) {
      try {
        // Exécuter la requête directement avec le pool
        await pool[client].query(`ALTER TABLE public.imprimante ENABLE TRIGGER ALL;`);
        
      } catch (err) {
       
      }
    }
  }, 1000); // 1000 ms = 1 seconde
}
const authRoutes = require('./routes/auth.routes');
const User = require('./models/auth.model'); // ou le chemin relatif correct
const { poolAuth } = require('./config/authconfig'); // adapte le chemin si nécessaire
const { verifyToken } = require('./middleware/auth.middleware');

const app = express();
const server = http.createServer(app);

// ✅ Ajout de CORS pour autoriser les requêtes cross-origin
app.use(cors());
app.use(express.json());

const io = new Server(server, { 
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Route de test
app.get('/test', (req, res) => {
    res.send('Route de test fonctionne');
});

// Utilisation des routeurs
console.log('Le routeur equipement est enregistré');
app.use('/api/equipements', verifyToken, equipementRouter);
console.log('Route /api/tickets enregistrée');
app.use('/api/tickets', ticketRouter);
console.log('Route /api/actions enregistrée');
app.use('/api/actions', actionRouter);
console.log('Route /api/users enregistrée');
app.use('/api/users', userRouter);
console.log('Route /api/userss enregistrée');
app.use('/api/userss', verifyToken, userssRouter);
console.log('Route /api/alerts enregistrée');
app.use('/api/alerts', alertRouter);
app.use('/api/auth', authRoutes);
// Route par défaut


// 🔍 Affichage des routes enregistrées pour le debug
app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(`Route enregistrée : ${r.route.path}`);
    }
});

// 📌 WebSocket: Gestion des connexions
io.on('connection', async (socket) => {
    const clientId = socket.handshake.query.clientId || socket.id; // Récupération de l'ID client depuis la requête WebSocket
    const databaseName = "unknown_database"; // Base par défaut (peut être modifiée en fonction de ta logique)

    console.log(`🔌 Connexion réussie pour ${clientId} (Base : ${databaseName})`);

    // Envoyer un message de bienvenue avec le nom de la base
    socket.emit('welcome', `Bienvenue, vous êtes connecté à la base ${databaseName}`);

    // Écouter un message envoyé par un client
    socket.on('message', (data) => {
        console.log(`📨 Message de ${clientId} (${databaseName}): ${data}`);
        io.emit('message', `Serveur (Base: ${databaseName}) a reçu: ${data}`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Déconnexion de ${clientId} (Base : ${databaseName})`);
    });
});

async function initializeUsers() {
    try {
        const userModel = new User(poolAuth);
        await userModel.createUserIfNotExists('admin1', 'admin1234', 'admin');
        await userModel.createUserIfNotExists('user', 'user123', 'user');
        console.log('Comptes admin et user initialisés');
    } catch (err) {
        console.error('Erreur lors de l\'initialisation des utilisateurs :', err.message);
    }
}
initializeUsers();

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
});
// En environnement Docker, le frontend est un service séparé
// Le backend ne doit servir que les API, pas les fichiers statiques
// Les routes API sont déjà définies ci-dessus

// Route pour les requêtes non-API - renvoie une réponse JSON au lieu de chercher un fichier HTML
app.get('*', (req, res) => {
    // Vérifier si la route commence par /api
    if (!req.path.startsWith('/api') && req.path !== '/test') {
        res.status(404).json({ message: 'Route API non trouvée' });
    }
});


// 📌 Démarrer le serveur HTTP + WebSocket
const port = process.env.PORT || 5000;
const host = process.env.HOST || '0.0.0.0';
server.listen(port, host, () => {
    console.log(`🚀 Serveur HTTP & WebSocket démarré sur http://${host}:${port}`);
    // Démarrer la réactivation automatique des triggers
    reactivateTriggersEverySecond();
    console.log("🔄 Activation de la réactivation périodique des triggers");
});

module.exports = io;
require('./listener');
