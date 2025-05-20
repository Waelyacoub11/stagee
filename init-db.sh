#!/bin/bash
set -e

# Attendre que PostgreSQL soit prêt
until PGPASSWORD=azazaz psql -h "db" -U "postgres" -c '\q'; do
  >&2 echo "PostgreSQL n'est pas encore prêt, attente..."
  sleep 1
done

# Créer les bases de données si elles n'existent pas
for db in auth techno1 techno2; do
  echo "Vérification de la base de données $db..."
  if ! PGPASSWORD=azazaz psql -h "db" -U "postgres" -lqt | cut -d \| -f 1 | grep -qw "$db"; then
    echo "Création de la base de données $db..."
    PGPASSWORD=azazaz createdb -h db -U postgres "$db"
    
    # Ici, vous pouvez ajouter des commandes pour importer des données initiales
    # par exemple :
    # if [ -f "/docker-entrypoint-initdb.d/$db.sql" ]; then
    #   PGPASSWORD=azazaz psql -h db -U postgres -d "$db" -f "/docker-entrypoint-initdb.d/$db.sql"
    # fi
  fi
done

echo "Initialisation de la base de données terminée !"
