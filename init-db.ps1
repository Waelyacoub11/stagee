# Script PowerShell pour initialiser les bases de données

# Attendre que PostgreSQL soit prêt
$env:PGPASSWORD = "azazaz"
$maxRetries = 30
$retryCount = 0
$connected = $false

while (-not $connected -and $retryCount -lt $maxRetries) {
    try {
        $result = & 'psql' '-h' 'db' '-U' 'postgres' '-c' '\q' 2>&1
        if ($LASTEXITCODE -eq 0) {
            $connected = $true
            Write-Host "Connexion à PostgreSQL réussie!"
        } else {
            Write-Host "En attente de PostgreSQL... ($($retryCount+1)/$maxRetries)"
            $retryCount++
            Start-Sleep -Seconds 2
        }
    } catch {
        Write-Host "Erreur de connexion: $_"
        $retryCount++
        Start-Sleep -Seconds 2
    }
}

if (-not $connected) {
    Write-Error "Impossible de se connecter à PostgreSQL après $maxRetries tentatives"
    exit 1
}

# Fonction pour vérifier si une base de données existe
function Test-DatabaseExists {
    param (
        [string]$dbname
    )
    
    $query = "SELECT 1 FROM pg_database WHERE datname = '$dbname'"
    $result = & 'psql' '-h' 'db' '-U' 'postgres' '-tAc' $query 2>&1
    return $result -match "1"
}

# Créer les bases de données si elles n'existent pas
$databases = @("auth", "techno1", "techno2")

foreach ($db in $databases) {
    Write-Host "Vérification de la base de données $db..."
    
    if (-not (Test-DatabaseExists -dbname $db)) {
        Write-Host "Création de la base de données $db..."
        & 'createdb' '-h' 'db' '-U' 'postgres' $db
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Erreur lors de la création de la base de données $db"
        } else {
            Write-Host "Base de données $db créée avec succès"
            
            # Ici, vous pouvez ajouter des commandes pour importer des données initiales
            # par exemple :
            # if (Test-Path "C:\docker-entrypoint-initdb.d\$db.sql") {
            #     Write-Host "Importation des données initiales pour $db..."
            #     & 'psql' '-h' 'db' '-U' 'postgres' '-d' $db '-f' "C:\docker-entrypoint-initdb.d\$db.sql"
            # }
        }
    } else {
        Write-Host "La base de données $db existe déjà"
    }
}

Write-Host "Initialisation des bases de données terminée !"
