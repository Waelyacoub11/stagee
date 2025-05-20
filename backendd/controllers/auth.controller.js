const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { poolAuth } = require('../config/authconfig');
const User = require('../models/user.model');

class AuthController {
    constructor() {
        this.userModel = new User();
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            
            // Récupérer l'utilisateur
            const result = await poolAuth.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );
            
            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'Identifiants invalides' });
            }
            
            const user = result.rows[0];
            
            // Comparer les mots de passe (en clair pour le moment)
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Identifiants invalides' });
            }
            
            // Générer le token
            const token = jwt.sign(
                { userId: user.id, username: user.username, role: user.role },
                'votre_secret_jwt',
                { expiresIn: '24h' }
            );
            
            res.json({ 
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            res.status(500).json({ message: 'Erreur lors de la connexion' });
        }
    }

    async register(req, res) {
        try {
            const { username, password, role } = req.body;
            
            // Vérifier si le rôle est valide
            if (!['superadmin1', 'superadmin2', 'globaladmin'].includes(role)) {
                return res.status(400).json({ message: 'Rôle invalide' });
            }

            const user = await this.userModel.createUser(username, password, role);
            res.status(201).json({
                message: 'Utilisateur créé avec succès',
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });
        } catch (err) {
            console.error('Erreur lors de l\'inscription:', err);
            if (err.code === '23505') { // Code d'erreur pour violation de contrainte unique
                res.status(400).json({ message: 'Ce nom d\'utilisateur existe déjà' });
            } else {
                res.status(500).json({ message: 'Erreur serveur' });
            }
        }
    }

    async getCurrentUser(req, res) {
        try {
            const result = await poolAuth.query(
                'SELECT id, username, role FROM users WHERE id = $1',
                [req.user.userId]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
        }
    }
}

module.exports = AuthController;
