// Script de débogage pour la table PDA
const { Pool } = require('pg');

// Configuration pour se connecter à la base de données Aurora
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'techno.cluster-cmb4eeaw4r2x.us-east-1.rds.amazonaws.com',
  database: process.env.DB_NAME || 'techno',
  password: process.env.DB_PASSWORD || 'Azazaz123!',
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false }
});

// Fonction principale de débogage
async function debugPdaTable() {
  try {
    console.log('Connexion à la base de données Aurora...');
    
    // Vérifier si la table PDA existe
    const tableCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pda')"
    );
    const pdaTableExists = tableCheck.rows[0].exists;
    console.log(`La table PDA existe-t-elle? ${pdaTableExists ? 'OUI' : 'NON'}`);
    
    if (pdaTableExists) {
      // Récupérer la structure de la table PDA
      const structureQuery = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'pda'"
      );
      console.log('Structure de la table PDA:');
      structureQuery.rows.forEach(row => {
        console.log(`- ${row.column_name}`);
      });
      
      // Récupérer tous les PDAs
      const pdasResult = await pool.query('SELECT * FROM pda');
      console.log(`Nombre total de PDAs: ${pdasResult.rows.length}`);
      
      // Afficher les PDAs
      if (pdasResult.rows.length > 0) {
        console.log('Exemples de PDAs:');
        pdasResult.rows.slice(0, 3).forEach((pda, index) => {
          console.log(`PDA #${index + 1}:`, JSON.stringify(pda, null, 2));
        });
        
        // Vérifier si des PDAs ont un modèle "MC2200"
        const mc2200Pdas = pdasResult.rows.filter(pda => 
          pda.modele && pda.modele.includes('MC2200')
        );
        console.log(`PDAs avec modèle MC2200: ${mc2200Pdas.length}`);
        if (mc2200Pdas.length > 0) {
          console.log('Exemple de PDA MC2200:', JSON.stringify(mc2200Pdas[0], null, 2));
        }
      } else {
        console.log('⚠️ La table PDA existe mais ne contient aucune donnée!');
      }
      
      // Récupérer tous les équipements pour comparer
      const equipementsResult = await pool.query('SELECT * FROM equipement');
      console.log(`Nombre total d'équipements: ${equipementsResult.rows.length}`);
      
      // Afficher quelques équipements
      if (equipementsResult.rows.length > 0) {
        console.log('Exemples d\'équipements:');
        equipementsResult.rows.slice(0, 3).forEach((equip, index) => {
          console.log(`Équipement #${index + 1}:`, JSON.stringify(equip, null, 2));
        });
      }
    } else {
      console.log('❌ La table PDA n\'existe pas dans la base de données!');
      
      // Vérifier les tables disponibles
      const tablesQuery = await pool.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );
      console.log('Tables disponibles dans la base de données:');
      tablesQuery.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('Erreur lors du débogage:', error.message);
  } finally {
    // Fermer la connexion
    await pool.end();
  }
}

// Exécuter la fonction de débogage
debugPdaTable();
