const { Pool } = require('pg');

// Configuration de la base de données d'authentification sur Aurora
const poolAuth = new Pool({
  user: process.env.AUTH_DB_USER || 'postgres',
  host: process.env.AUTH_DB_HOST || 'localhost',
  database: process.env.AUTH_DB_NAME || 'auth',
  password: process.env.AUTH_DB_PASSWORD || 'azazaz',
  port: process.env.AUTH_DB_PORT || 5432,
  //ssl: process.env.SSL_ENABLED === 'true' || true ? { rejectUnauthorized: false } : false,  // SSL config pour Aurora
  //max: 20,  // Paramètres de pool recommandés pour Aurora
  //idleTimeoutMillis: 30000,
  //connectionTimeoutMillis: 2000
});

// Log de la configuration pour le débogage
console.log('Configuration du cluster Aurora pour auth:', {
  host: process.env.AUTH_DB_HOST,
  user: process.env.AUTH_DB_USER,
  database: process.env.AUTH_DB_NAME,
  port: process.env.AUTH_DB_PORT,
  //ssl: process.env.SSL_ENABLED === 'true' || true
});

// console.log("Configuration du pool auth :", poolAuth);  // Log du pool pour vérifier s'il est bien instancié

// Création de la table users si elle n'existe pas


// Création des utilisateurs par défaut






module.exports = { poolAuth };
