-- Script d'initialisation des bases de données techno1 et techno2

-- Table equipement
CREATE TABLE IF NOT EXISTS equipement (
    idequipement SERIAL PRIMARY KEY,
    modele VARCHAR(255) NOT NULL,
    ipadresse VARCHAR(15) NOT NULL,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'actif',
    emplacement VARCHAR(255),
    description TEXT
);

-- Table information (pour les alertes)
CREATE TABLE IF NOT EXISTS information (
    idinformation SERIAL PRIMARY KEY,
    idequipement INTEGER REFERENCES equipement(idequipement) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    statut VARCHAR(50) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    severite VARCHAR(20) CHECK (severite IN ('faible', 'moyenne', 'haute', 'critique')),
    traitee BOOLEAN DEFAULT FALSE,
    date_traitement TIMESTAMP
);

-- Données de test pour equipement
INSERT INTO equipement (modele, ipadresse, emplacement, description)
VALUES 
    ('Routeur Cisco 2900', '192.168.1.1', 'Salle serveur', 'Routeur principal'),
    ('Switch HP 1920', '192.168.1.2', 'Salle réseau', 'Switch principal'),
    ('Serveur Dell R740', '192.168.1.10', 'Salle serveur', 'Serveur principal');

-- Données de test pour information
INSERT INTO information (idequipement, type, message, statut, severite)
VALUES 
    (1, 'Connexion', 'Connexion établie', 'succes', 'faible'),
    (1, 'Surcharge', 'Utilisation CPU à 90%', 'avertissement', 'moyenne'),
    (2, 'Erreur', 'Port 24 en erreur', 'erreur', 'haute'),
    (3, 'Sauvegarde', 'Sauvegarde terminée', 'succes', 'faible');
