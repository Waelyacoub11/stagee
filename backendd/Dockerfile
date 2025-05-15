# Utiliser une image Node.js Alpine
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./


# Installer les dépendances
RUN npm install

# Copier les fichiers sources
COPY . .

# Exposer le port 5000 (ou le port que vous utilisez)
EXPOSE 5000

# Démarrer l'application
CMD ["npm", "start"]
