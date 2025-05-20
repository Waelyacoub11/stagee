const Userss = require('../models/userss.model');
const pools = require('../config/config');
const UserssModel = require('../models/userss.model');

// Récupérer tous les utilisateurs
exports.getAllUserss = async (req, res) => {
    try {
        const users = await Userss.getAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('Erreur dans le contrôleur getAllUserss:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des utilisateurs',
            error: error.message
        });
    }
};

// Récupérer un utilisateur par son ID
exports.getUserssById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Userss.getById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Erreur dans le contrôleur getUserssById:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération de l\'utilisateur',
            error: error.message
        });
    }
};

// Récupérer les utilisateurs par rôle
exports.getUserssByRole = async (req, res) => {
    try {
        console.log("🔍 Récupération des utilisateurs par rôle...");
        console.log("Données de requête:", {
            body: req.body,
            user: req.user || 'Non authentifié',
            method: req.method,
            url: req.originalUrl
        });
        
        const selectedBase = req.body.selectedBase;
        let allUsers = {};

        // Vérifier si l'utilisateur est authentifié
        if (!req.user) {
            console.error("❌ Utilisateur non authentifié dans getUserssByRole");
            return res.status(401).json({ error: "Utilisateur non authentifié." });
        }

        console.log(`Rôle de l'utilisateur: ${req.user.role}`);

        if (req.user.role === "globaladmin") {
            // Le globaladmin voit tous les utilisateurs
            console.log("Traitement pour globaladmin");
            if (selectedBase) {
                console.log(`Base sélectionnée: ${selectedBase}`);
                // Si une base spécifique est sélectionnée
                try {
                    const userModel = new UserssModel(pools[selectedBase]);
                    const users = await userModel.getAllUserss();
                    console.log(`${users.length} utilisateurs récupérés pour ${selectedBase}`);
                    allUsers[selectedBase] = users;
                    return res.status(200).json(allUsers);
                } catch (error) {
                    console.error(
                        `❌ Erreur lors de la récupération des utilisateurs pour ${selectedBase}:`,
                        error
                    );
                    allUsers[selectedBase] = [];
                    return res.status(200).json(allUsers);
                }
            }

            // Si aucune base n'est sélectionnée, récupérer depuis toutes les bases
            console.log("Aucune base sélectionnée, récupération depuis toutes les bases");
            for (const client in pools) {
                console.log(`Traitement de la base ${client}...`);
                try {
                    const userModel = new UserssModel(pools[client]);
                    const users = await userModel.getAllUserss();
                    console.log(`${users.length} utilisateurs récupérés pour ${client}`);
                    allUsers[client] = users;
                } catch (error) {
                    console.error(
                        `❌ Erreur lors de la récupération des utilisateurs pour ${client}:`,
                        error
                    );
                    allUsers[client] = [];
                }
            }
        } else if (req.user.role === "superadmin1") {
            // superadmin1 ne voit que les utilisateurs de techno1
            console.log("Traitement pour superadmin1 - Base techno1 uniquement");
            try {
                const userModel = new UserssModel(pools.techno1);
                const users = await userModel.getAllUserss();
                console.log(`${users.length} utilisateurs récupérés pour techno1`);
                allUsers.techno1 = users;
            } catch (error) {
                console.error(
                    "❌ Erreur lors de la récupération des utilisateurs pour techno1:",
                    error
                );
                allUsers.techno1 = [];
            }
        } else if (req.user.role === "superadmin2") {
            // superadmin2 ne voit que les utilisateurs de techno2
            console.log("Traitement pour superadmin2 - Base techno2 uniquement");
            try {
                const userModel = new UserssModel(pools.techno2);
                const users = await userModel.getAllUserss();
                console.log(`${users.length} utilisateurs récupérés pour techno2`);
                allUsers.techno2 = users;
            } catch (error) {
                console.error(
                    "❌ Erreur lors de la récupération des utilisateurs pour techno2:",
                    error
                );
                allUsers.techno2 = [];
            }
        } else {
            // Pour les autres rôles, renvoyer un objet vide
            console.log(`Rôle non reconnu: ${req.user.role}, renvoie de données vides`);
        }

        console.log("Données à renvoyer:", {
            techno1: allUsers.techno1 ? allUsers.techno1.length : 0,
            techno2: allUsers.techno2 ? allUsers.techno2.length : 0,
        });

        res.status(200).json(allUsers);
    } catch (err) {
        console.error("❌ Erreur lors de la récupération des utilisateurs par rôle:", err);
        res.status(500).json({ error: "Impossible de récupérer les utilisateurs." });
    }
};