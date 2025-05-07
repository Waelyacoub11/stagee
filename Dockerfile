# Étape 1 : build du frontend
FROM node:18 AS frontend-builder
WORKDIR /app/TechnoMstr

# Copier les fichiers package.json et package-lock.json (si présents) pour une gestion optimisée du cache
COPY TechnoMstr/package*.json ./

# Installer les dépendances du frontend
RUN npm install --legacy-peer-deps

# Copier le reste des fichiers frontend et construire le frontend
COPY TechnoMstr/ .
RUN npm run build

# Étape 2 : build final (backend + frontend dist)
FROM node:18

# Installer les outils nécessaires pour compiler bcrypt
RUN apt-get update && apt-get install -y build-essential python3

WORKDIR /app

# Copier les fichiers backend (package.json et package-lock.json)
COPY backendd/package*.json ./backendd/
WORKDIR /app/backendd

# Installer les dépendances du backend
RUN npm install --legacy-peer-deps

# Supprimer bcrypt préinstallé et le réinstaller depuis les sources pour garantir la compatibilité
RUN rm -rf node_modules/bcrypt && npm install bcrypt --build-from-source

# Copier les fichiers backend restants
COPY backendd/ ./

# Copier les fichiers frontend buildés depuis l'étape précédente
COPY --from=frontend-builder /app/TechnoMstr/dist ../TechnoMstr/dist

EXPOSE 3000

# Lancer le serveur backend
CMD ["node", "server.js"]
