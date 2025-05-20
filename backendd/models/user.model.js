// models/user.model.js
const bcrypt = require('bcryptjs');
const { poolAuth } = require('../config/authconfig');

class User {
    constructor() {
        this.pool = poolAuth;
    }

    async createUser(username, password, role) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await this.pool.query(
                'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
                [username, hashedPassword, role]
            );
            return result.rows[0];
        } catch (err) {
            console.error('Erreur lors de la création de l\'utilisateur:', err);
            throw err;
        }
    }

    async authenticateUser(username, password) {
        try {
            const result = await this.pool.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );
            
            if (result.rows.length === 0) {
                return null;
            }

            const user = result.rows[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                // Mettre à jour le last_login
                await this.pool.query(
                    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
                    [user.id]
                );
                return {
                    id: user.id,
                    username: user.username,
                    role: user.role
                };
            }
            return null;
        } catch (err) {
            console.error('Erreur lors de l\'authentification:', err);
            throw err;
        }
    }

    async getUserByUsername(username) {
        try {
            const result = await this.pool.query(
                'SELECT id, username, role FROM users WHERE username = $1',
                [username]
            );
            return result.rows[0];
        } catch (err) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', err);
            throw err;
        }
    }

    // Méthode pour récupérer tous les utilisateurs
    async getAllUsers() {
        try {
            const query = 'SELECT * FROM users';
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
            throw new Error("Erreur serveur");
        }
    }

    // Méthode pour récupérer un utilisateur par son ID
    async getUserById(id) {
        try {
            const query = 'SELECT * FROM users WHERE id = $1';
            const result = await this.pool.query(query, [id]);
            return result.rows[0];  // Retourner l'utilisateur trouvé
        } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur:", error);
            throw new Error("Erreur serveur");
        }
    }
}

module.exports = User;
