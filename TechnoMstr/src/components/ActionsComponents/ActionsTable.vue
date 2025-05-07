<template>
  <div class="container">
    <!-- Sélecteur d'entreprise -->
    <div class="company-selector">
      <h3>Sélectionner une entreprise :</h3>
      <select v-model="selectedBase" class="select-style">
        <option disabled value="">-- Choisir une entreprise --</option>
        <option v-for="base in availableBases" :key="base" :value="base">
          {{ base }}
        </option>
      </select>
    </div>

    <!-- Barre de recherche -->
    <div class="search-container">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Rechercher..."
        class="search-input"
      />
    </div>

    <!-- Titre de la section -->
    <div class="section-header">
      <h2>Dernières actions</h2>
    </div>

    <!-- Tableau des actions -->
    <div class="table-container">
      <table class="action-table">
        <thead>
          <tr>
            <th>Adresse IP</th>
            <th>Numéro de série</th>
            <th>Type de commande</th>
            <th>Détails</th>
            <th>Ancienne valeur</th>
            <th>Nouvelle valeur</th>
            <th>Date d'exécution</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="action in displayedActions" :key="action.idaction">
            <td>{{ action.ipadresse }}</td>
            <td>{{ action.serialnumber }}</td>
            <td>{{ action.command_type }}</td>
            <td>{{ action.command_details }}</td>
            <td>{{ action.old_value }}</td>
            <td>{{ action.new_value }}</td>
            <td>{{ formatDate(action.executed_at) }}</td>
            <td>
              <button @click="viewActionDetails(action)" class="details-button">
                Détails
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal pour les détails -->
    <div v-if="selectedActionId !== null" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Détails de l'Action</h2>
          <button @click="closeActionDetails" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Adresse IP</span>
              <span class="info-value">{{ selectedAction?.ipadresse }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Numéro de série</span>
              <span class="info-value">{{ selectedAction?.serialnumber }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Type de commande</span>
              <span class="info-value">{{ selectedAction?.command_type }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Détails</span>
              <span class="info-value">{{ selectedAction?.command_details }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ancienne valeur</span>
              <span class="info-value">{{ selectedAction?.old_value }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Nouvelle valeur</span>
              <span class="info-value">{{ selectedAction?.new_value }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date d'exécution</span>
              <span class="info-value">{{ formatDate(selectedAction?.executed_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
  background-color: #f9fafb;
}

.company-selector {
  margin-bottom: 20px;
}

.company-selector h3 {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
}

.select-style {
  width: 100%;
  max-width: 300px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-container {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  max-width: 300px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.section-header {
  background-color: #007bff;
  color: white;
  padding: 15px 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.table-container {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.action-table {
  width: 100%;
  border-collapse: collapse;
}

.action-table th {
  background-color: #007bff;
  color: white;
  text-align: left;
  padding: 12px 15px;
  font-weight: 600;
  font-size: 14px;
}

.action-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.action-table tbody tr:hover {
  background-color: #f8f9fa;
}

.details-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.details-button:hover {
  background-color: #218838;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  background-color: #007bff;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.info-grid {
  display: grid;
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  color: #333;
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const searchQuery = ref('');
const selectedBase = ref('');
const selectedActionId = ref(null);
const selectedAction = ref(null);
const actions = ref([]);

// Computed property pour les bases disponibles
const availableBases = computed(() => {
  if (!authStore.user) return [];
  
  switch (authStore.user.role) {
    case 'superadmin1':
      return ['Techno 1'];
    case 'superadmin2':
      return ['Techno 2'];
    case 'globaladmin':
      return ['Techno 1', 'Techno 2'];
    default:
      return [];
  }
});

// Pagination
const currentPage = ref({ "Techno 1": 1, "Techno 2": 1 });
const actionsPerPage = 7;

// En-têtes du tableau
const headers = [
  "Adresse IP",
  "Numéro de série",
  "Type de commande",
  "Détails",
  "Ancienne valeur",
  "Nouvelle valeur",
  "Date d'exécution"
];

// Tri initial
const sortColumn = ref('idaction');
const sortDirection = ref('asc');

// Si l'utilisateur n'a accès qu'à une seule base, la sélectionner automatiquement
onMounted(() => {
  if (availableBases.value.length === 1) {
    selectedBase.value = availableBases.value[0]
  }

  axios.get("http://localhost:3000/api/actions") // Remplacez par votre URL
    .then(response => {
      let allActions = [];
      if (Array.isArray(response.data.techno1)) {
        response.data.techno1.forEach(action => {
          action.source = 'Techno 1'; // Ajout d'un champ pour indiquer la source
          allActions.push(action);
        });
      }
      if (Array.isArray(response.data.techno2)) {
        response.data.techno2.forEach(action => {
          action.source = 'Techno 2'; // Ajout d'un champ pour indiquer la source
          allActions.push(action);
        });
      }
      actions.value = allActions;
    })
    .catch(error => {
      console.error("Erreur lors du chargement des actions:", error);
    });
});

// Mapper les en-têtes aux clés des objets
const headerToKey = (header) => {
  const mapping = {
    'Adresse IP': 'ipadresse',
    'Numéro de série': 'numserie',
    'Type de commande': 'command_type',
    'Détails': 'command_details',
    'Ancienne valeur': 'old_value',
    'Nouvelle valeur': 'new_value',
    "Date d'exécution": 'executed_at'
  };
  return mapping[header];
};

// Fonction de tri
const sortBy = (header) => {
  const key = headerToKey(header);
  if (sortColumn.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = key;
    sortDirection.value = 'asc';
  }
};

// Computed property pour les actions à afficher
const displayedActions = computed(() => {
  let filteredActions = actions.value;

  // Filtrer par base sélectionnée
  if (selectedBase.value) {
    filteredActions = filteredActions.filter(action => action.source === selectedBase.value);
  }

  // Filtrer par recherche
  if (searchQuery.value) {
    const searchLower = searchQuery.value.toLowerCase();
    filteredActions = filteredActions.filter(action => 
      Object.values(action).some(value => 
        String(value).toLowerCase().includes(searchLower)
      )
    );
  }

  // Trier par date d'exécution (plus récent en premier)
  return filteredActions
    .sort((a, b) => new Date(b.executed_at) - new Date(a.executed_at))
    .slice(0, 5);
});

// Calcul des dernières actions
const latestActions = computed(() => {
  const result = { "Techno 1": [], "Techno 2": [] };
  
  // Filtrer et trier les actions par base
  actions.value.forEach(action => {
    if (action.source === 'Techno 1') {
      result['Techno 1'].push(action);
    } else if (action.source === 'Techno 2') {
      result['Techno 2'].push(action);
    }
  });

  // Trier par date d'exécution et prendre les 5 dernières pour chaque base
  Object.keys(result).forEach(base => {
    result[base].sort((a, b) => new Date(b.executed_at) - new Date(a.executed_at));
    result[base] = result[base].slice(0, 5);
  });

  return result;
});

// Actions paginées
const paginatedActions = computed(() => {
  const result = {};
  Object.keys(latestActions.value).forEach(base => {
    const start = (currentPage.value[base] - 1) * actionsPerPage;
    const end = start + actionsPerPage;
    result[base] = latestActions.value[base].slice(start, end);
  });
  return result;
});

// Nombre total de pages
const totalPages = (techno) => {
  return Math.ceil(latestActions.value[techno].length / actionsPerPage);
};

// Pagination : Page précédente
const prevPage = (techno) => {
  if (currentPage.value[techno] > 1) currentPage.value[techno]--;
};

// Pagination : Page suivante
const nextPage = (techno) => {
  if (currentPage.value[techno] < totalPages(techno)) currentPage.value[techno]++;
};

// Gestion de la sélection
const handleActionSelect = (action) => {
  selectedActionId.value = action.idaction;
};

// Afficher les détails
const viewActionDetails = (action) => {
  selectedAction.value = action;
  selectedActionId.value = action.idaction;
};

// Fermer les détails
const closeActionDetails = () => {
  selectedActionId.value = null;
  selectedAction.value = null;
};

// Ajouter la fonction formatDate dans la section script
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString();
};
</script>