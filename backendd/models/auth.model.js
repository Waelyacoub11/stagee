const bcrypt = require('bcryptjs');

class User {
    constructor(pool) {
        if (!pool) {
            throw new Error('Connexion à la base de données invalide');
        }
        this.pool = pool;
    }

    async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await this.pool.query(query, [username]);
        return result.rows[0];
    }

    async createUser(username, password, role) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role';
        const result = await this.pool.query(query, [username, hashedPassword, role]);
        return result.rows[0];
    }

    async createUserIfNotExists(username, password, role) {
        const existingUser = await this.findByUsername(username);
        if (!existingUser) {
            return await this.createUser(username, password, role);
        }
        return existingUser; // déjà existant
    }
}

module.exports = User;
