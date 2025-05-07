const bcrypt = require('bcryptjs');
const { poolAuth } = require('./config/authconfig'); // adapte le chemin si besoin

async function migratePasswords() {
    try {
        const res = await poolAuth.query('SELECT id, password FROM users');

        for (const user of res.rows) {
            const currentPassword = user.password;

            // Ignore si déjà haché
            if (currentPassword.startsWith('$2b$')) continue;

            const hashedPassword = await bcrypt.hash(currentPassword, 10);
            await poolAuth.query(
                'UPDATE users SET password = $1 WHERE id = $2',
                [hashedPassword, user.id]
            );
            console.log(`✅ Utilisateur ID ${user.id} : mot de passe haché`);
        }

        console.log('\n🚀 Migration terminée avec succès.');
    } catch (err) {
        console.error('❌ Erreur lors de la migration :', err);
    } finally {
        await poolAuth.end();
    }
}

migratePasswords();
