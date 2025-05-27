<template>
  <div class="container">
    <!-- ✅ Ajout du titre général -->
    <h1 class="page-title">Tous les tickets</h1>

    <!-- Barre de recherche et filtres -->
  

    <!-- Sélecteur d'entreprise -->
    <div class="company-selector">
      <label class="block text-lg font-semibold mb-2">Sélectionner une entreprise :</label>
      <select v-model="selectedBase" class="p-2 border rounded w-full max-w-sm shadow-sm">
        <option disabled value="">-- Choisir une entreprise --</option>
        <option v-for="base in availableBases" :key="base" :value="base">
          {{ base }}
        </option>
      </select>
    </div>
      <div class="header-section">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Rechercher dans tous les champs..."
          class="search-input"
        />
        <i class="ti ti-search search-icon"></i>
      </div>
      <div class="filter-priorite">
        <label for="priorite-filter">Filtrer par priorité:</label>
        <select v-model="priorityFilter" class="select-filter">
          <option value="">Toutes les priorités</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
    </div>

    <!-- Section tickets avec pagination -->
    <div v-if="!selectedBase && openTickets.length > 0">
      <h2 class="section-title">Tickets ouverts de toutes les Entreprises</h2>
      <div class="table-container">
        <table class="styled-table">
          <thead>
            <tr>
              <th v-for="header in headers" :key="header" @click="sortBy(header)" class="table-header">
                <div class="header-content">
                  <span>{{ header }}</span>
                  <i :class="getSortIcon(header)"></i>
                </div>
              </th>
              <th class="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in openTickets" :key="ticket.idticket" class="table-row">
              <td class="table-cell">
                {{ ticket.sujet }}
                <span v-if="ticket.is_technocode_ticket" class="technocode-tag">[TechnoCode]</span>
              </td>
              <td class="table-cell description-cell">{{ ticket.description }}</td>
              <td class="table-cell">
                <span class="priority-badge" :class="priorityClass(ticket.priority)">
                  {{ ticket.priority }}
                </span>
              </td>
              <td class="table-cell">{{ ticket.agent_nom ? `${ticket.agent_nom} ${ticket.agent_prenom}` : ticket.agent }}</td>
              <td class="table-cell">{{ ticket.requester_nom ? `${ticket.requester_nom} ${ticket.requester_prenom}` : ticket.requester }}</td>
              <td class="table-cell">{{ ticket.serialnumber }}</td>
              <td class="table-cell">{{ ticket.piecesaremplacer }}</td>
              <td class="table-cell">
                <span class="status-badge" :class="statusClass(ticket.statut)">
                  {{ ticket.statut }}
                </span>
              </td>
              <td class="table-cell">{{ formatDate(ticket.created_at) }}</td>
              <td class="table-cell actions-cell">
                <button @click="viewTicketDetails(ticket)" class="details-button">
                  <i class="ti ti-eye"></i>
                  Détails
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section tickets de l'entreprise sélectionnée -->
    <div v-if="selectedBase && paginatedTickets[selectedBase] && paginatedTickets[selectedBase].length > 0">
      <h2 class="section-title">{{ selectedBase }}</h2>
      <div class="table-container">
        <table class="styled-table">
          <thead>
            <tr>
              <th v-for="header in headers" :key="header" @click="sortBy(header)" class="table-header">
                <div class="header-content">
                  <span>{{ header }}</span>
                  <i :class="getSortIcon(header)"></i>
                </div>
              </th>
              <th class="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in paginatedTickets[selectedBase]" :key="ticket.idticket" class="table-row">
              <td class="table-cell">
                {{ ticket.sujet }}
                <span v-if="ticket.is_technocode_ticket" class="technocode-tag">[TechnoCode]</span>
              </td>
              <td class="table-cell description-cell">{{ ticket.description }}</td>
              <td class="table-cell">
                <span class="priority-badge" :class="priorityClass(ticket.priority)">
                  {{ ticket.priority }}
                </span>
              </td>
              <td class="table-cell">{{ ticket.agent_nom ? `${ticket.agent_nom} ${ticket.agent_prenom}` : ticket.agent }}</td>
              <td class="table-cell">{{ ticket.requester_nom ? `${ticket.requester_nom} ${ticket.requester_prenom}` : ticket.requester }}</td>
              <td class="table-cell">{{ ticket.serialnumber }}</td>
              <td class="table-cell">{{ ticket.piecesaremplacer }}</td>
              <td class="table-cell">
                <span class="status-badge" :class="statusClass(ticket.statut)">
                  {{ ticket.statut }}
                </span>
              </td>
              <td class="table-cell">{{ formatDate(ticket.created_at) }}</td>
              <td class="table-cell actions-cell">
                <button @click="viewTicketDetails(ticket)" class="details-button">
                  <i class="ti ti-eye"></i>
                  Détails
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button @click="prevPage(selectedBase)" :disabled="currentPage[selectedBase] === 1" class="pagination-button">
          <i class="ti ti-chevron-left"></i>
          Précédent
        </button>
        <span class="page-info">Page {{ currentPage[selectedBase] }} / {{ totalPages(selectedBase) }}</span>
        <button @click="nextPage(selectedBase)" :disabled="currentPage[selectedBase] >= totalPages(selectedBase)" class="pagination-button">
          Suivant
          <i class="ti ti-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Modal des détails -->
    <div v-if="selectedTicketId !== null" class="modal-overlay">
      <div class="modal-content">
        <h2>
          Détails du Ticket #{{ selectedTicket.idticket }}
          <span v-if="selectedTicket.is_technocode_ticket" class="technocode-tag">[TechnoCode]</span>
        </h2>
        <div class="info-grid">
          <div class="info-item enterprise-info">
            <p><strong>Entreprise:</strong> 
              <span class="enterprise-badge" :class="{'techno1-badge': selectedTicket.enterprise === 'Techno 1', 'techno2-badge': selectedTicket.enterprise === 'Techno 2'}">
                {{ selectedTicket.enterprise || 'Non spécifiée' }}
              </span>
            </p>
          </div>
          <div class="info-item">
            <p><strong>Sujet:</strong> {{ selectedTicket.sujet }}</p>
          </div>
          <div class="info-item">
            <p><strong>Description:</strong> {{ selectedTicket.description }}</p>
          </div>
          <div class="info-item">
            <p><strong>Priorité:</strong> 
              <span class="priority-badge" :class="priorityClass(selectedTicket.priority)">
                {{ selectedTicket.priority }}
              </span>
            </p>
          </div>
          <div class="info-item">
            <p><strong>Agent:</strong> {{ selectedTicket.agent_nom ? `${selectedTicket.agent_nom} ${selectedTicket.agent_prenom}` : selectedTicket.agent }}</p>
          </div>
          <div class="info-item">
            <p><strong>Demandeur:</strong> {{ selectedTicket.requester_nom ? `${selectedTicket.requester_nom} ${selectedTicket.requester_prenom}` : selectedTicket.requester }}</p>
          </div>
          <div class="info-item">
            <p><strong>Numéro de série:</strong> {{ selectedTicket.serialnumber }}</p>
          </div>
          <div class="info-item">
            <p><strong>Pièces à remplacer:</strong> {{ selectedTicket.piecesaremplacer }}</p>
          </div>
          <div class="info-item">
            <p><strong>Statut:</strong> 
              <span class="status-badge" :class="statusClass(selectedTicket.statut)">
                {{ selectedTicket.statut }}
              </span>
            </p>
          </div>
          <div class="info-item">
            <p><strong>Date de création:</strong> {{ formatDate(selectedTicket.created_at) }}</p>
          </div>
        </div>
        <button @click="closeTicketDetails" class="close-button">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore'

// Données initiales
const searchQuery = ref('');
const priorityFilter = ref('');
const sortColumn = ref('created_at');
const sortDirection = ref('desc');
const tickets = ref([]);
const selectedTicketId = ref(null);
const selectedTicket = ref(null);
const selectedBase = ref('');
const currentPage = ref({ 'Techno 1': 1, 'Techno 2': 1 });
const itemsPerPage = 7;

const authStore = useAuthStore()

// En-têtes du tableau
const headers = [
  "Sujet",
  "Description",
  "Priorité",
  "Agent",
  "Demandeur",
  "Numéro de série",
  "Pièces à remplacer",
  "Statut",
  "Date de création"
];

// Remplacer la définition de availableBases par une computed property
const availableBases = computed(() => {
  if (!authStore.user) return []
  
  switch (authStore.user.role) {
    case 'superadmin1':
      return ['Techno 1']
    case 'superadmin2':
      return ['Techno 2']
    case 'globaladmin':
      return ['Techno 1', 'Techno 2']
    default:
      return []
  }
})

// Si l'utilisateur n'a accès qu'à une seule base, la sélectionner automatiquement
onMounted(async () => {
  if (availableBases.value.length === 1) {
    selectedBase.value = availableBases.value[0]
  }
  
  try {
    const response = await axios.get("http://localhost:5000/api/tickets");
    let allTickets = [];
    if (Array.isArray(response.data.techno1)) {
      response.data.techno1.forEach(ticket => {
        ticket.source = 'Techno 1';
        allTickets.push(ticket);
      });
    }
    if (Array.isArray(response.data.techno2)) {
      response.data.techno2.forEach(ticket => {
        ticket.source = 'Techno 2';
        allTickets.push(ticket);
      });
    }
    tickets.value = allTickets;
  } catch (error) {
    console.error("Erreur lors du chargement des tickets:", error);
  }
});

// Fonction pour obtenir l'icône de tri
const getSortIcon = (header) => {
  const key = headerToKey(header);
  return [
    'ti',
    sortColumn.value === key
      ? sortDirection.value === 'asc'
        ? 'ti-chevron-up'
        : 'ti-chevron-down'
      : 'ti-chevron-down'
  ];
};

// Mapper les en-têtes aux clés
const headerToKey = (header) => {
  const mapping = {
    'Sujet': 'sujet',
    'Description': 'description',
    'Priorité': 'priority',
    'Agent': 'agent_nom',
    'Demandeur': 'requester_nom',
    'Numéro de série': 'serialnumber',
    'Pièces à remplacer': 'piecesaremplacer',
    'Statut': 'statut',
    'Date de création': 'created_at'
  };
  return mapping[header];
};

// Tickets filtrés et triés
const filteredAndSortedTickets = computed(() => {
  let filtered = [...tickets.value];

  // Filtrage par base
  if (selectedBase.value) {
    filtered = filtered.filter(ticket => ticket.source === selectedBase.value);
  }

  // Recherche globale
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase();
    filtered = filtered.filter(ticket =>
      Object.values(ticket).some(value =>
        String(value).toLowerCase().includes(search)
      )
    );
  }

  // Filtrage par priorité
  if (priorityFilter.value) {
    filtered = filtered.filter(ticket => ticket.priority === priorityFilter.value);
  }

  // Tri
  const key = sortColumn.value;
  filtered.sort((a, b) => {
    if (key === 'created_at') {
      return sortDirection.value === 'asc'
        ? new Date(a[key]) - new Date(b[key])
        : new Date(b[key]) - new Date(a[key]);
    }
    
    const aVal = String(a[key] || '').toLowerCase();
    const bVal = String(b[key] || '').toLowerCase();
    return sortDirection.value === 'asc'
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });

  return filtered;
});

// Tickets paginés
const paginatedTickets = computed(() => {
  const result = { 'Techno 1': [], 'Techno 2': [] };
  const filtered = filteredAndSortedTickets.value;

  filtered.forEach(ticket => {
    if (ticket.source) {
      result[ticket.source].push(ticket);
    }
  });

  Object.keys(result).forEach(base => {
    const start = (currentPage.value[base] - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    result[base] = result[base].slice(start, end);
  });

  return result;
});

// Tickets ouverts de toutes les bases avec indication de l'entreprise
const openTickets = computed(() => {
  let result = [];
  
  // Récupérer les tickets de l'API
  if (tickets.value && tickets.value.length > 0) {
    // Filtrer d'abord les tickets ouverts
    const openTicketsFiltered = filteredAndSortedTickets.value.filter(ticket => ticket.statut === "Ouvert");
    
    // Essayer de déterminer l'entreprise pour chaque ticket
    result = openTicketsFiltered.map(ticket => {
      // Essayer de déterminer l'entreprise par la source si disponible
      if (ticket.source) {
        return { ...ticket, _enterprise: ticket.source };
      }
      
      // Si pas de source, vérifier d'autres attributs spécifiques
      // Exemple basé sur le serialnumber ou d'autres attributs
      
      // Logique simple: ajouter une propriété _enterprise à chaque ticket
      // En alternance pour la démonstration
      return { ...ticket, _enterprise: ticket.idticket % 2 === 0 ? 'Techno 1' : 'Techno 2' };
    });
  }
  
  return result.slice(0, 10); // Limite à 10 tickets pour ne pas surcharger l'interface
});

// Derniers tickets (conservé pour compatibilité)
const latestTickets = computed(() => {
  return filteredAndSortedTickets.value
    .slice(0, 5);
});

// Fonctions de pagination
const totalPages = (base) => {
  const filtered = filteredAndSortedTickets.value.filter(t => t.source === base);
  return Math.ceil(filtered.length / itemsPerPage);
};

const prevPage = (base) => {
  if (currentPage.value[base] > 1) {
    currentPage.value[base]--;
  }
};

const nextPage = (base) => {
  if (currentPage.value[base] < totalPages(base)) {
    currentPage.value[base]++;
  }
};

// Tri des colonnes
const sortBy = (header) => {
  const key = headerToKey(header);
  if (sortColumn.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = key;
    sortDirection.value = 'asc';
  }
};

// Formatage de la date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Classes CSS
const priorityClass = (priority) => {
  if (!priority) return '';
  return `priority-${priority.toLowerCase()}`;
};

const statusClass = (statut) => {
  if (!statut) return '';
  return `status-${statut.toLowerCase()}`;
};

// Gestion des détails
const viewTicketDetails = (ticket) => {
  // Déterminer l'entreprise du ticket
  let enterprise = 'Non spécifiée';
  
  if (selectedBase.value) {
    // Si une base est sélectionnée, utiliser cette base
    enterprise = selectedBase.value;
  } else {
    // Si on est dans la vue "tous les tickets", déterminer l'entreprise
    // en fonction des données disponibles
    if (ticket.source) {
      enterprise = ticket.source;
    } else if (ticket._enterprise) {
      enterprise = ticket._enterprise;
    } else {
      // On peut aussi faire une vérification sur le serial number ou d'autres propriétés
      // pour déterminer l'entreprise
      enterprise = determineEnterpriseFromTicket(ticket);
    }
  }
  
  // Ajouter l'entreprise aux informations du ticket
  selectedTicket.value = { ...ticket, enterprise };
  selectedTicketId.value = ticket.idticket;
};

const closeTicketDetails = () => {
  selectedTicketId.value = null;
  selectedTicket.value = null;
};

// Fonction pour déterminer l'entreprise d'un ticket basé sur ses attributs
const determineEnterpriseFromTicket = (ticket) => {
  // Vérification si le ticket est dans la liste des tickets ouverts
  const techno1Tickets = openTickets.value.filter(t => t._enterprise === 'Techno 1');
  const techno2Tickets = openTickets.value.filter(t => t._enterprise === 'Techno 2');
  
  // Vérifier si l'ID du ticket correspond à un ticket dans Techno 1 ou Techno 2
  if (techno1Tickets.some(t => t.idticket === ticket.idticket)) {
    return 'Techno 1';
  } else if (techno2Tickets.some(t => t.idticket === ticket.idticket)) {
    return 'Techno 2';
  }
  
  // Si nous n'avons pas pu déterminer l'entreprise par la liste des tickets ouverts,
  // essayer d'autres méthodes de détermination
  // Par exemple, en fonction du serial number ou d'autres attributs spécifiques
  
  return 'Non spécifiée';
};

// Computed property pour filtrer les tickets selon la base sélectionnée
const filteredTickets = computed(() => {
  if (!authStore.selectedDatabase) return []
  return tickets.value.filter(ticket => ticket.database === authStore.selectedDatabase)
})
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

/* Priority badges */
.priority-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
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

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.status-resolu {
  background-color: #28a745 !important;
}

.status-ouvert {
  background-color: #fd7e14 !important;
}

/* Supprimer les anciennes classes qui ne sont pas utilisées */
.high-priority-text, .medium-priority-text, .low-priority-text,
.status-en-cours {
  display: none;
}

@media (max-width: 768px) {
  .modal-content {
    width: 90%;
    margin: 20px;
    padding: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .close-button {
    top: 10px;
    right: 10px;
  }
}

/* Ajuster l'espacement des badges dans la modal */
.info-item .priority-badge,
.info-item .status-badge {
  margin-left: 8px;
}

/* Nouveau style simplifié pour le tag TechnoCode */
.technocode-tag {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  background-color: #e6f0ff;
  color: #3b82f6;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

/* Styles pour les badges d'entreprise */
.enterprise-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.techno1-badge {
  background-color: #4C6EF5 !important; /* Bleu pour Techno 1 */
}

.techno2-badge {
  background-color: #7048E8 !important; /* Violet pour Techno 2 */
}

/* Style pour mettre en évidence l'info d'entreprise */
.enterprise-info {
  grid-column: 1 / -1;
  background-color: #E6F7FF;
  border-left: 4px solid #1890FF;
}

/* Supprimer les styles non utilisés */
.technocode-badge,
.technocode-row,
.technocode-indicator,
.technocode-info {
  display: none;
}
</style>