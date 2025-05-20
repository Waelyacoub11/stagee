<template>
  <div class="card h-full">
    <div class="card-header p-3">
      <div class="d-flex align-items-center justify-content-between">
        <h5 class="card-title mb-0">Liste des Utilisateurs</h5>
        <div class="d-flex gap-2 flex-wrap">
          <button 
            v-for="role in ['Tous', 'superadmin', 'admin', 'technicien', 'user']" 
            :key="role"
            @click="setFilter(role.toLowerCase())"
            class="btn btn-sm text-uppercase fw-medium px-3 py-1"
            :class="[
              getRoleVariant(role, currentFilter === role.toLowerCase()),
              'border-0 shadow-sm'
            ]"
          >
            {{ role }}
          </button>
        </div>
      </div>
    </div>
    <div class="card-body p-0">
      <div v-if="loading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
      <div v-else-if="error" class="alert alert-danger m-3">
        <strong>Erreur:</strong> {{ error }}
        <div class="mt-2">
          <button @click="loadUsers" class="btn btn-sm btn-outline-secondary me-2">
            <i class="bi bi-arrow-repeat"></i> Réessayer
          </button>
        </div>
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Rôle</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="allUsers.length === 0">
              <td colspan="4" class="text-center text-muted py-4">
                <i class="bi bi-people-fill fs-1 d-block mb-2"></i>
                Aucun utilisateur trouvé
              </td>
            </tr>
            <tr v-for="(user, index) in allUsers" :key="user.id || index">
              <td>{{ user.nom || 'Non défini' }}</td>
              <td>{{ user.prenom || 'Non défini' }}</td>
              <td>
                <span 
                  class="badge" 
                  :class="{
                    'bg-success': user.roleuser === 'superadmin',
                    'bg-primary': user.roleuser === 'admin',
                    'bg-info': user.roleuser === 'technicien',
                    'bg-secondary': !user.roleuser || user.roleuser === 'user'
                  }"
                >
                  {{ user.roleuser || 'user' }}
                </span>
              </td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'bg-success': user.statut === 'active',
                    'bg-danger': user.statut === 'inactive',
                    'bg-warning': !user.statut
                  }"
                >
                  {{ user.statut || 'Non défini' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const techno1Users = ref([]);
const techno2Users = ref([]);
const loading = ref(false);
const error = ref(null);
const dataSource = ref('Non initialisé');
const loadingMessage = ref('Initialisation...');
const loadingStep = ref('');
const displayMode = ref('combined'); // 'combined' ou 'separate'
const executionLog = ref([]);

// États calculés
const hasToken = computed(() => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
});

const currentFilter = ref('tous');

const props = defineProps({
  selectedBase: String,
  role: {
    type: String,
    default: 'globaladmin' // Valeur par défaut si la propriété n'est pas passée
  },
});

// Retourne la classe de couleur en fonction du rôle (cohérent avec le tableau)
const getRoleVariant = (role, isActive) => {
  const variants = {
    'superadmin': 'bg-success',
    'admin': 'bg-primary',
    'technicien': 'bg-info',
    'user': 'bg-secondary',
    'tous': 'bg-dark'
  };
  
  const base = variants[role.toLowerCase()] || 'bg-secondary';
  
  if (isActive) {
    return `${base} text-white`;
  } else {
    // Version claire pour les boutons inactifs
    const lightVariants = {
      'bg-success': 'bg-opacity-10 text-success',
      'bg-primary': 'bg-opacity-10 text-primary',
      'bg-info': 'bg-opacity-10 text-info',
      'bg-secondary': 'bg-opacity-10 text-secondary',
      'bg-dark': 'bg-opacity-10 text-dark'
    };
    return `${lightVariants[base] || 'bg-light text-dark'} border`;
  }
};

const allUsers = computed(() => {
  const combined = [];
  
  console.log('Role actuel:', props.role);
  console.log('Base sélectionnée:', props.selectedBase);
  console.log('Utilisateurs techno1:', techno1Users.value.length);
  console.log('Utilisateurs techno2:', techno2Users.value.length);
  
  // Ajouter les utilisateurs selon le rôle et la base sélectionnée
  
  // Cas 1: Globaladmin avec base sélectionnée
  if (props.role === 'globaladmin' && props.selectedBase) {
    if (props.selectedBase === 'techno1') {
      techno1Users.value.forEach(user => {
        combined.push({ ...user, source: 'techno1' });
      });
    } else if (props.selectedBase === 'techno2') {
      techno2Users.value.forEach(user => {
        combined.push({ ...user, source: 'techno2' });
      });
    }
  }
  // Cas 2: Superadmin1 - Toujours techno1 uniquement
  else if (props.role === 'superadmin1') {
    techno1Users.value.forEach(user => {
      combined.push({ ...user, source: 'techno1' });
    });
  }
  // Cas 3: Superadmin2 - Toujours techno2 uniquement
  else if (props.role === 'superadmin2') {
    techno2Users.value.forEach(user => {
      combined.push({ ...user, source: 'techno2' });
    });
  }
  // Cas 4: Globaladmin sans sélection ou autre rôle - Montre les deux
  else {
    techno1Users.value.forEach(user => {
      combined.push({ ...user, source: 'techno1' });
    });
    techno2Users.value.forEach(user => {
      combined.push({ ...user, source: 'techno2' });
    });
  }
  
  console.log('Utilisateurs combinés avant filtrage:', combined.length);
  
  // Filtrer par rôle si un filtre est activé
  const filtered = currentFilter.value === 'tous' 
    ? combined 
    : combined.filter(user => user.roleuser?.toLowerCase() === currentFilter.value);
  
  console.log('Utilisateurs après filtrage par rôle:', filtered.length);
  
  // Trier par nom
  return filtered.sort((a, b) => {
    const nameA = `${a.nom || ''} ${a.prenom || ''}`.trim().toLowerCase();
    const nameB = `${b.nom || ''} ${b.prenom || ''}`.trim().toLowerCase();
    return nameA.localeCompare(nameB);
  });
});

// Définir le filtre actif
const setFilter = (role) => {
  currentFilter.value = role;
  addLog(`Filtre appliqué: ${role}`);
};

// Fonction de log
const addLog = (message) => {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;
  executionLog.value.push(logEntry);
  console.log(logEntry);
  // Garder seulement les 10 derniers logs
  if (executionLog.value.length > 10) {
    executionLog.value = executionLog.value.slice(-10);
  }
};

// Changer le mode d'affichage
const setDisplayMode = (mode) => {
  displayMode.value = mode;
  addLog(`Mode d'affichage changé: ${mode}`);
};

// Aller à la page de connexion
const goToLogin = () => {
  addLog('Navigation vers la page de connexion');
  router.push('/login');
};

// Actualisation manuelle
const manualRefresh = async () => {
  addLog('Actualisation manuelle déclenchée');
  await loadUsersFromAPI();
};

// Charger les données depuis l'API
const loadUsersFromAPI = async () => {
  if (!hasToken.value) {
    error.value = "Authentification requise";
    return;
  }
  
  loading.value = true;
  loadingMessage.value = 'Connexion à l\'API...';
  error.value = null;
  techno1Users.value = [];
  techno2Users.value = [];
  
  try {
    loadingStep.value = 'Préparation de la requête API';
    addLog('=== Début chargement ===');
    addLog('Préparation de la requête API avec filtrage par rôle');
    addLog(`Rôle actuel: ${props.role || 'non défini'}`);
    
    const storedToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!storedToken) {
      console.error("Aucun token disponible dans le sessionStorage ou localStorage");
      error.value = "Authentification requise - Token manquant";
      loading.value = false;
      return;
    }
    
    loadingStep.value = 'Récupération des données selon le rôle';
    addLog('Chargement des utilisateurs selon le rôle');
    
    console.log('Chargement des utilisateurs avec rôle:', props.role);
    console.log('Base sélectionnée:', props.selectedBase);
    
    // Utiliser l'API standard pour récupérer les données
    let response = await axios.get("http://localhost:5000/api/userss", {
      headers: {
        Authorization: `Bearer ${storedToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('Données brutes reçues:', response.data);
    
    // Formater les données selon le format attendu et le rôle de l'utilisateur
    if (Array.isArray(response.data)) {
      const formattedData = {};
      
      // Pour un globaladmin avec une base sélectionnée
      if (props.role === 'globaladmin' && props.selectedBase) {
        console.log(`Globaladmin: filtre des utilisateurs pour ${props.selectedBase}`);
        if (props.selectedBase === 'techno1') {
          formattedData.techno1 = response.data;
          formattedData.techno2 = [];
        } else if (props.selectedBase === 'techno2') {
          formattedData.techno1 = [];
          formattedData.techno2 = response.data;
        }
      }
      // Pour un superadmin1 (toujours techno1)
      else if (props.role === 'superadmin1') {
        console.log('Superadmin1: affichage des utilisateurs de techno1 uniquement');
        formattedData.techno1 = response.data;
        formattedData.techno2 = [];
      }
      // Pour un superadmin2 (toujours techno2)
      else if (props.role === 'superadmin2') {
        console.log('Superadmin2: affichage des utilisateurs de techno2 uniquement');
        formattedData.techno1 = [];
        formattedData.techno2 = response.data;
      }
      // Pour un globaladmin sans sélection (montre les deux)
      else {
        console.log('Globaladmin sans sélection ou autre rôle: affichage de tous les utilisateurs');
        formattedData.techno1 = response.data;
        formattedData.techno2 = response.data;
      }
      
      response.data = formattedData;
      addLog(`Format de données adapté pour affichage - Role: ${props.role}, Base: ${props.selectedBase || 'aucune'}`);
    }
  
    console.log('Données après formatage par rôle/base:', {
      techno1: response.data?.techno1?.length || 0,
      techno2: response.data?.techno2?.length || 0
    });
    
    loadingStep.value = 'Traitement des données';
    addLog('Traitement des données reçues');
    
    if (response.data) {
      console.log('Structure de la réponse:', Object.keys(response.data));
      
      // Réinitialiser les tableaux d'utilisateurs
      techno1Users.value = [];
      techno2Users.value = [];
      
      // Vérifier le format de la réponse et adapter si nécessaire
      if (Array.isArray(response.data)) {
        // Si la réponse est un tableau simple, on considère que ce sont des utilisateurs de techno2
        console.log('Réponse au format tableau simple, adaptation...');
        techno2Users.value = response.data;
        addLog(`Format tableau: ${techno2Users.value.length} utilisateurs assignés à techno2`);
      } else {
        // Traiter les données selon la base
        if (response.data.techno1 && Array.isArray(response.data.techno1)) {
          techno1Users.value = response.data.techno1;
          console.log('Utilisateurs techno1 détectés:', techno1Users.value);
          addLog(`Techno1: ${techno1Users.value.length} utilisateurs chargés`);
        } else {
          console.log('Aucun utilisateur techno1 dans la réponse');
        }
        
        if (response.data.techno2 && Array.isArray(response.data.techno2)) {
          techno2Users.value = response.data.techno2;
          console.log('Utilisateurs techno2 détectés:', techno2Users.value);
          addLog(`Techno2: ${techno2Users.value.length} utilisateurs chargés`);
        } else {
          console.log('Aucun utilisateur techno2 dans la réponse');
        }
      }
      
      const totalUsers = techno1Users.value.length + techno2Users.value.length;
      dataSource.value = `API - ${totalUsers} utilisateurs (${techno1Users.value.length} + ${techno2Users.value.length})`;
      
      addLog(`Succès: Total de ${totalUsers} utilisateurs chargés`);
    } else {
      error.value = 'Format de réponse invalide';
      dataSource.value = 'Erreur';
      addLog('Format de réponse invalide');
    }
    
  } catch (err) {
    addLog(`Erreur: ${err.message}`);
    console.error('Erreur complète:', err);
    
    let errorMessage = 'Erreur lors du chargement des données';
    
    if (err.code === 'ECONNABORTED') {
      errorMessage = 'Timeout - Le serveur ne répond pas';
    } else if (err.code === 'ECONNREFUSED') {
      errorMessage = 'Connexion refusée - Serveur API non accessible';
    } else if (err.response) {
      const status = err.response.status;
      if (status === 401) {
        errorMessage = 'Authentification requise pour accéder aux données';
      } else if (status === 404) {
        errorMessage = 'Endpoint API introuvable (/api/userss/role)';
      } else if (status >= 500) {
        errorMessage = 'Erreur serveur interne';
      } else {
        errorMessage = `Erreur HTTP ${status}`;
      }
    } else if (err.request) {
      errorMessage = 'Impossible de joindre le serveur';
    }
    
    error.value = errorMessage;
    dataSource.value = 'Erreur';
    techno1Users.value = [];
    techno2Users.value = [];
    
  } finally {
    loading.value = false;
    loadingMessage.value = '';
    loadingStep.value = '';
    addLog('=== Fin chargement ===');
  }
};

// Observer les changements de selectedBase
watch(() => props.selectedBase, async () => {
  addLog(`Base sélectionnée changée: ${props.selectedBase}`);
  await loadUsersFromAPI();
});

// Chargement initial des données
onMounted(() => {
  addLog('Composant monté - Chargement des utilisateurs selon le rôle');
  loadUsersFromAPI();
});
</script>

<style scoped>
.card {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: none;
  border-radius: 0.5rem;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  padding: 0.75rem 1.25rem;
  border-top-left-radius: 0.5rem !important;
  border-top-right-radius: 0.5rem !important;
}

.card-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-responsive {
  flex: 1;
  overflow: auto;
}

.table {
  margin-bottom: 0;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
  font-weight: 500;
  border-radius: 0.25rem;
}

.badge-sm {
  font-size: 0.65rem;
  padding: 0.25em 0.5em;
}

.bg-success { background-color: #198754 !important; }
.bg-primary { background-color: #0d6efd !important; }
.bg-info { background-color: #0dcaf0 !important; }
.bg-secondary { background-color: #6c757d !important; }
.bg-danger { background-color: #dc3545 !important; }
.bg-warning { background-color: #ffc107 !important; color: #000; }

.card-title {
  margin: 0;
  font-weight: 600;
  color: #495057;
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: #6c757d;
  border-top: none;
  padding: 0.75rem 1rem;
}

.table td {
  vertical-align: middle;
  padding: 0.75rem 1rem;
  border-top: 1px solid #e9ecef;
}

.table-sm th,
.table-sm td {
  padding: 0.5rem 0.75rem;
}

.btn-group .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner-border {
  width: 1.5rem;
  height: 1.5rem;
  border-width: 0.2em;
}

.card-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.125);
  font-size: 0.85rem;
  background-color: #f8f9fa;
}

.text-muted {
  color: #6c757d !important;
}

.fs-1 {
  font-size: calc(1.375rem + 1.5vw) !important;
}

/* Styles pour les cartes séparées */
.card .card {
  box-shadow: 0 0.05rem 0.1rem rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card .card-header {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
}

.row {
  margin: 0;
}

.col-md-6 {
  padding: 0.5rem;
}
</style>