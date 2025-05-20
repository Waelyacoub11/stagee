const { Pool } = require('pg');

// Configuration de la base de données d'authentification
const poolAuth = new Pool({
  user: process.env.AUTH_DB_USER || 'postgres',
  host: process.env.AUTH_DB_HOST || 'localhost',
  database: process.env.AUTH_DB_NAME || 'auth',
  password: process.env.AUTH_DB_PASSWORD || 'azazaz',
  port: process.env.AUTH_DB_PORT || 5432,
});

// Log de la configuration pour le débogage
console.log('Configuration de la base auth:', {
  host: process.env.AUTH_DB_HOST,
  user: process.env.AUTH_DB_USER,
  database: process.env.AUTH_DB_NAME,
  port: process.env.AUTH_DB_PORT
});

// console.log("Configuration du pool auth :", poolAuth);  // Log du pool pour vérifier s'il est bien instancié

// Création de la table users si elle n'existe pas
async function createUsersTable() {
  try {
    const client = await poolAuth.connect();
    // Vérifier d'abord si la table existe
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!checkTable.rows[0].exists) {
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin1', 'superadmin2', 'globaladmin')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP
        )
      `);
      console.log('Table users créée avec succès');
    } else {
      console.log('Table users existe déjà');
    }
    client.release();
  } catch (err) {
    console.error('Erreur lors de la création de la table users:', err.message);
  }
}

// Création des utilisateurs par défaut
async function createDefaultUsers() {
  try {
    const client = await poolAuth.connect();
    const defaultUsers = [
      { username: 'superadmin1', password: 'superadmin1', role: 'superadmin1' },
      { username: 'superadmin2', password: 'superadmin2', role: 'superadmin2' },
     
      { username: 'globaladmin', password: 'admin123', role: 'globaladmin' }
    ];

    for (const user of defaultUsers) {
      // Vérifier si l'utilisateur existe déjà
      const checkUser = await client.query(
        'SELECT * FROM users WHERE username = $1',
        [user.username]
      );

      if (checkUser.rows.length === 0) {
        // Hasher le mot de passe
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Créer l'utilisateur
        await client.query(
          'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
          [user.username, hashedPassword, user.role]
        );
        console.log(`Utilisateur ${user.username} créé avec succès`);
      } else {
        console.log(`Utilisateur ${user.username} existe déjà`);
      }
    }
    client.release();
  } catch (err) {
    console.error('Erreur lors de la création des utilisateurs par défaut:', err.message);
  }
}

// Tester la connexion à la base auth
async function testConnection() {
  try {
    const client = await poolAuth.connect();
    console.log('Connexion à la base de données auth réussie');
    client.release();
    await createUsersTable();
    await createDefaultUsers();
  } catch (err) {
    console.error('Erreur de connexion à la base de données auth:', err.message);
  }
}

testConnection();

module.exports = { poolAuth };
