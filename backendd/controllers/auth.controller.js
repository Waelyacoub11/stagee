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
            console.log('=== NOUVELLE TENTATIVE DE CONNEXION ===');
            console.log('Login attempt with data:', { username: req.body.username });
            const { username, password } = req.body;
            
            if (!username || !password) {
                console.log('Missing username or password');
                return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });
            }
            
            // Récupérer l'utilisateur
            console.log('Querying database for user:', username);
            const result = await poolAuth.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );
            
            if (result.rows.length === 0) {
                console.log('❌ No user found with username:', username);
                return res.status(401).json({ message: 'Identifiants invalides' });
            }
            
            const user = result.rows[0];
            console.log('✅ User found in database:', { 
                id: user.id, 
                username: user.username, 
                role: user.role,
                password: user.password ? '***' : 'null',
                password_length: user.password ? user.password.length : 0,
                password_starts_with: user.password ? user.password.substring(0, 10) + '...' : 'null'
            });
            
            // Vérifier si le mot de passe est haché (support pour $2a$ et $2b$)
            const isPasswordHashed = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
            console.log('🔑 Password is hashed:', isPasswordHashed);
            
            // Comparer les mots de passe
            let isMatch = false;
            if (isPasswordHashed) {
                console.log('🔐 Comparing hashed password with bcrypt...');
                isMatch = await bcrypt.compare(password, user.password);
                console.log('🔑 bcrypt.compare result:', isMatch);
                
                if (!isMatch) {
                    console.log('⚠️  bcrypt compare failed, checking if password is stored in plain text as fallback');
                    // Vérifier si le mot de passe en clair correspond (pour la rétrocompatibilité)
                    isMatch = (password === user.password);
                    console.log('🔑 Plain text fallback match:', isMatch);
                }
            } else if (user.password) {
                // Pour la rétrocompatibilité avec les mots de passe en clair
                console.log('🔓 Comparing plain text password...');
                isMatch = (password === user.password);
                console.log('🔑 Plain text password match:', isMatch);
            }
            
            if (!isMatch) {
                console.log('❌ Invalid password for user:', username);
                return res.status(401).json({ message: 'Identifiants invalides' });
            }
            
            // Utiliser le JWT_SECRET de l'environnement ou une valeur par défaut
            const jwtSecret = process.env.JWT_SECRET || 'votre_secret_jwt';
            
            // Générer le token
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    username: user.username, 
                    role: user.role 
                },
                jwtSecret,
                { expiresIn: '24h' }
            );
            
            console.log('Login successful for user:', username);
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
            // Envoyer plus de détails en développement
            const errorResponse = {
                message: 'Erreur lors de la connexion',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
            res.status(500).json(errorResponse);
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
