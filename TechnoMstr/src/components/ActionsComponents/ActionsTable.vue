<template>
  <div class="container">
    <!-- ✅ Ajout du titre général -->
    <h1 class="page-title">Tous les actions</h1>

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
    <h2 class="section-title">Dernières actions</h2>

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
          <tr v-for="action in selectedBase ? paginatedActions[selectedBase] : displayedActions" :key="action.idaction">
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
    
    <!-- Pagination pour l'entreprise sélectionnée -->
    <div class="pagination" v-if="selectedBase && paginatedActions[selectedBase] && paginatedActions[selectedBase].length > 0">
      <button @click="prevPage(selectedBase)" :disabled="currentPage[selectedBase] === 1">
        Précédent
      </button>
      <span>Page {{ currentPage[selectedBase] }} / {{ totalPages(selectedBase) }}</span>
      <button @click="nextPage(selectedBase)" :disabled="currentPage[selectedBase] >= totalPages(selectedBase)">
        Suivant
      </button>
    </div>

    <!-- Modal des détails -->
    <div v-if="selectedActionId !== null" class="modal-overlay">
      <div class="modal-content">
        <h2>
          Détails de l'Action #{{ selectedAction?.idaction }}
        </h2>
        <div class="info-grid">
          <div class="info-item">
            <p><strong>Adresse IP:</strong> {{ selectedAction?.ipadresse }}</p>
          </div>
          <div class="info-item">
            <p><strong>Numéro de série:</strong> {{ selectedAction?.serialnumber }}</p>
          </div>
          <div class="info-item">
            <p><strong>Type de commande:</strong> {{ selectedAction?.command_type }}</p>
          </div>
          <div class="info-item">
            <p><strong>Détails:</strong> {{ selectedAction?.command_details }}</p>
          </div>
          <div class="info-item">
            <p><strong>Ancienne valeur:</strong> {{ selectedAction?.old_value }}</p>
          </div>
          <div class="info-item">
            <p><strong>Nouvelle valeur:</strong> {{ selectedAction?.new_value }}</p>
          </div>
          <div class="info-item">
            <p><strong>Date d'exécution:</strong> {{ formatDate(selectedAction?.executed_at) }}</p>
          </div>
        </div>
        <button @click="closeActionDetails" class="close-button">Fermer</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  font-family: 'Roboto', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
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

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 20px;
  text-align: center;
  padding: 10px;
  background-color: #007bff;
  border-radius: 8px;
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

/* Styles de pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background-color: #0056b3;
}

.pagination button:disabled {
  background-color: #e5e7eb;
  cursor: not-allowed;
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

  axios.get("http://localhost:5000/api/actions") // Remplacez par votre URL
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

  // Trier par date d'exécution pour chaque base
  Object.keys(result).forEach(base => {
    result[base].sort((a, b) => new Date(b.executed_at) - new Date(a.executed_at));
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
<style scoped>
.container {
  font-family: 'Roboto', sans-serif;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9fafb;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #0f0f0f;
  margin-bottom: 24px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
}

.search-bar {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  font-size: 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.filter-priorite {
  display: flex;
  align-items: center;
  gap: 12px;
}

.select-filter {
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-filter:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.company-selector {
  margin-bottom: 24px;
}

.table-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 24px;
}

.styled-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table-header {
  background-color: #007bff;
  color: white;
  font-weight: 600;
  padding: 16px;
  text-align: left;
  border-bottom: 2px solid #e5e7eb;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.table-header:hover {
  background-color: #0056b3;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-cell {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  vertical-align: middle;
}

.table-row {
  transition: background-color 0.3s ease;
}

.table-row:hover {
  background-color: #f8fafc;
}

.description-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.priority-badge,
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

.priority-high {
  background-color: #dc3545 !important;
}

.priority-medium {
  background-color: #fd7e14 !important;
}

.priority-low {
  background-color: #28a745 !important;
}

.status-resolu {
  background-color: #28a745 !important;
}

.status-ouvert {
  background-color: #fd7e14 !important;
}

.actions-cell {
  text-align: center;
}

.details-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.details-button:hover {
  background-color: #2563eb;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: white;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-button:not(:disabled):hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
}

@media (max-width: 1024px) {
  .header-section {
    flex-direction: column;
  }

  .search-bar,
  .filter-priorite {
    width: 100%;
  }

  .description-cell {
    max-width: 150px;
  }
}

@media (max-width: 768px) {
  .table-container {
    overflow-x: auto;
  }

  .styled-table {
    min-width: 1000px;
  }

  .header-section {
    gap: 12px;
  }
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  position: relative;
}

.modal-content h2 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 20px;
  text-align: center;
  padding: 10px;
  background-color: #007bff;
  border-radius: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.info-item {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-item p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.info-item strong {
  color: #666;
  display: block;
  margin-bottom: 5px;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #dc3545;
}

</style>