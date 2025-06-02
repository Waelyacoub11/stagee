<template>
  
  <div class="container">
    <!-- ✅ Ajout du titre général -->
    <h1 class="page-title">Équipements</h1>
    
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

    <div class="search-bar" style="margin-top: 20px;">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Rechercher..."
        @input="handleSearch"
      />
    </div>

    <!-- Section équipements non disponibles avant sélection d'entreprise -->
    <div v-if="!selectedBase && unavailableEquipments.length > 0">
      <h2 class="section-title">Équipements non disponibles de toutes les Entreprises</h2>
      <table class="styled-table">
        <thead>
          <tr>
            <th v-for="header in headers" :key="header" @click="sortBy(header)">{{ header }}</th>
            <th>Entreprise</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="equipment in unavailableEquipments" :key="equipment.idequipement">
            <td>{{ equipment.modele }}</td>
            <td>{{ equipment.ipadresse }}</td>
            <td :class="getAvailabilityClass(equipment.disponibilite)">
              {{ equipment.disponibilite ? 'Disponible' : 'Non disponible' }}
            </td>
            <td>{{ equipment.serialnumber || 'N/A' }}</td>
            <td>{{ equipment.contrast || 'N/A' }}</td>
            <td>{{ equipment.vitesse || 'N/A' }}</td>
            <td>{{ equipment.typeimpression || 'N/A' }}</td>
            
            <td>
              <button @click="viewEquipmentDetails(equipment)" class="details-button" type="button">Détails</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Section équipements de l'entreprise sélectionnée -->
    <div v-if="selectedBase && paginatedEquipments[selectedBase] && paginatedEquipments[selectedBase].length > 0">
      <h2 class="section-title">{{ selectedBase }}</h2>
      <table class="styled-table">
        <thead>
          <tr>
            <th v-for="header in headers" :key="header" @click="sortBy(header)">{{ header }}</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="equipment in paginatedEquipments[selectedBase]" :key="equipment.modele">
            <td>{{ equipment.modele }}</td>
            <td>{{ equipment.ipadresse }}</td>
            <td :class="getAvailabilityClass(equipment.disponibilite)">
              {{ equipment.disponibilite ? 'Disponible' : 'Non disponible' }}
            </td>
            <td>{{ equipment.serialnumber || 'N/A' }}</td>
            <td>{{ equipment.contrast || 'N/A' }}</td>
            <td>{{ equipment.vitesse || 'N/A' }}</td>
            <td>{{ equipment.typeimpression || 'N/A' }}</td>
            <td>
              <button @click="viewEquipmentDetails(equipment)" class="details-button" type="button">Détails</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination pour l'entreprise sélectionnée -->
      <div class="pagination">
        <button @click="prevPage(selectedBase)" :disabled="currentPage[selectedBase] === 1">Précédent</button>
        <span>Page {{ currentPage[selectedBase] }} / {{ totalPages(selectedBase) }}</span>
        <button @click="nextPage(selectedBase)" :disabled="currentPage[selectedBase] >= totalPages(selectedBase)">Suivant</button>
      </div>
    </div>

    <!-- Modal pour les détails de l'équipement -->
    <div v-if="selectedEquipment" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Détails de l'Équipement</h2>
          <button @click="closeModal" class="close-button">×</button>
        </div>
        <!-- Indication de l'entreprise -->
        <div class="origin-indicator">
          Entreprise: <span class="enterprise-badge" :class="{'techno1-badge': selectedEquipment.origin === 'Techno 1', 'techno2-badge': selectedEquipment.origin === 'Techno 2'}">{{ selectedEquipment.origin || 'Non spécifiée' }}</span>
        </div>
        <div class="modal-body">
          <div class="info-section">
            <h3>Informations Générales</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Modèle</span>
                <span class="info-value">{{ selectedEquipment.modele }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Adresse IP</span>
                <span class="info-value">{{ selectedEquipment.ipadresse }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Disponibilité</span>
                <span :class="['status-badge', getAvailabilityClass(selectedEquipment.disponibilite)]">
                  {{ selectedEquipment.disponibilite ? 'Disponible' : 'Non disponible' }}
                </span>
              </div>
            </div>
          </div>
          <div class="info-section">
            <h3>Spécifications Techniques</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Numéro de série</span>
                <span class="info-value">{{ selectedEquipment.serialnumber || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Contraste</span>
                <span class="info-value">{{ selectedEquipment.contrast || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Vitesse</span>
                <span class="info-value">{{ selectedEquipment.vitesse || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Type d'impression</span>
                <span class="info-value">{{ selectedEquipment.typeimpression || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from '@/stores/authStore'

// Données initiales
const searchQuery = ref("");
const sortField = ref(null);
const sortDirection = ref("asc");
const equipments = ref([]);
const selectedEquipment = ref(null);
const selectedBase = ref('');

// Ajout de l'authStore
const authStore = useAuthStore()

// Remplacer availableBases par une computed property
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

// Pagination
const itemsPerPage = 7;
const currentPage = ref({ "Techno 1": 1, "Techno 2": 1 });

// En-têtes du tableau
const headers = [
  "Modèle", 
  "Adresse IP", 
  "Disponibilité",
  "Numéro de série (PDA/Imprimante)",
  "Contraste",
  "Vitesse",
  "Type d'impression"
];

// Récupération des équipements depuis l'API
onMounted(() => {
  // Sélectionner automatiquement la base si l'utilisateur n'a accès qu'à une seule
  if (availableBases.value.length === 1) {
    selectedBase.value = availableBases.value[0]
  }

  axios.get("http://localhost:5000/api/equipements")
    .then(response => {
      let allEquipments = [];
      if (Array.isArray(response.data.techno1)) {
        response.data.techno1.forEach(equipment => {
          equipment.source = "Techno 1";
          allEquipments.push(equipment);
        });
      }
      if (Array.isArray(response.data.techno2)) {
        response.data.techno2.forEach(equipment => {
          equipment.source = "Techno 2";
          allEquipments.push(equipment);
        });
      }
      // Tri des équipements par ID décroissant
      equipments.value = allEquipments.sort((a, b) => b.idequipement - a.idequipement);
    })
    .catch(error => {
      console.error("Erreur lors du chargement des équipements:", error);
    });
});

// Équipements filtrés par recherche globale
const filteredEquipments = computed(() => {
  let filtered = equipments.value;

  // Filtrage par base sélectionnée
  if (selectedBase.value) {
    filtered = filtered.filter(equipment => equipment.source === selectedBase.value);
  }

  // Recherche globale
  if (searchQuery.value) {
    filtered = filtered.filter(equipment =>
      Object.values(equipment).some(value =>
        String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }

  return filtered;
});

// Équipements triés
const sortedEquipments = computed(() => {
  const groupedEquipments = { "Techno 1": [], "Techno 2": [] };

  filteredEquipments.value.forEach(equipment => {
    groupedEquipments[equipment.source].push(equipment);
  });

  // Tri par défaut par ID décroissant pour chaque groupe
  for (const base in groupedEquipments) {
    groupedEquipments[base].sort((a, b) => b.idequipement - a.idequipement);
  }

  return groupedEquipments;
});

// Équipements non disponibles de toutes les bases
const unavailableEquipments = computed(() => {
  // Filtrer d'abord tous les équipements non disponibles
  const nonAvailable = equipments.value.filter(equipment => !equipment.disponibilite);
  
  // Si la recherche est active, filtrer selon le terme de recherche
  let filtered = nonAvailable;
  if (searchQuery.value) {
    filtered = filtered.filter(equipment =>
      Object.values(equipment).some(value =>
        String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  
  // Trier les équipements par source (Techno 1 ou Techno 2)
  if (sortField.value) {
    filtered.sort((a, b) => {
      const aValue = a[sortField.value] || '';
      const bValue = b[sortField.value] || '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection.value === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection.value === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
    });
  } else {
    // Tri par défaut par ID décroissant
    filtered.sort((a, b) => b.idequipement - a.idequipement);
  }
  
  // Limiter à un nombre raisonnable d'équipements
  return filtered.slice(0, 15); // Montrer les 15 premiers équipements non disponibles
});

// Calcul des derniers équipements (conservé pour compatibilité)
const latestEquipments = computed(() => {
  return equipments.value.slice(0, 5);
});

// Équipements paginés
const paginatedEquipments = computed(() => {
  const groupedEquipments = { "Techno 1": [], "Techno 2": [] };

  for (const base in sortedEquipments.value) {
    const start = (currentPage.value[base] - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    groupedEquipments[base] = sortedEquipments.value[base].slice(start, end);
  }

  return groupedEquipments;
});

// Nombre total de pages
const totalPages = (techno) => {
  return Math.ceil(sortedEquipments.value[techno].length / itemsPerPage);
};

// Changement de page
const prevPage = (techno) => {
  if (currentPage.value[techno] > 1) currentPage.value[techno]--;
};

const nextPage = (techno) => {
  if (currentPage.value[techno] < totalPages(techno)) currentPage.value[techno]++;
};

// Tri des colonnes
const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDirection.value = "asc";
  }
};

// Ouvrir la fenêtre modale avec les détails de l'équipement
const viewEquipmentDetails = (equipment) => {
  try {
    console.log("Bouton Détails cliqué", equipment);
    console.log("Equipements disponibles:", equipments.value);
    
    if (equipment) {
      // Ajouter un identifiant original de l'équipement
      let equipmentId = equipment.serialnumber || equipment.ipadresse;
      console.log("Identificateur de l'équipement:", equipmentId);
      
      // Identifier directement la base
      let origin = "Inconnue";
      
      // Si nous sommes déjà dans une vue filtrée par base
      if (selectedBase.value) {
        console.log("Base déjà sélectionnée:", selectedBase.value);
        origin = selectedBase.value;
      } 
      // Si l'équipement a une source définie, l'utiliser directement
      else if (equipment.source) {
        origin = equipment.source;
        console.log("Source définie dans l'équipement:", origin);
      }
      // Si l'équipement est affiché dans la liste des non-disponibles de toutes les bases
      else if (unavailableEquipments.value) {
        // Déterminer de quelle liste l'équipement provient
        const techno1EquipmentIds = (equipments.value["Techno 1"] || []).map(e => e.serialnumber || e.ipadresse);
        console.log("IDs des équipements de Techno 1:", techno1EquipmentIds);
        
        if (techno1EquipmentIds.includes(equipmentId)) {
          origin = "Techno 1";
          console.log("Trouvé dans Techno 1!");
        } else {
          const techno2EquipmentIds = (equipments.value["Techno 2"] || []).map(e => e.serialnumber || e.ipadresse);
          console.log("IDs des équipements de Techno 2:", techno2EquipmentIds);
          
          if (techno2EquipmentIds.includes(equipmentId)) {
            origin = "Techno 2";
            console.log("Trouvé dans Techno 2!");
          }
        }
      }
      
      // Les données montrent que les mêmes équipements existent dans les deux bases
      // Notre priorité est d'abord de déterminer la base de l'équipement sélectionné
      if (origin === "Inconnue") {
        // Si l'équipement vient d'une base sélectionnée, utiliser cette base
        if (selectedBase.value) {
          origin = selectedBase.value;
          console.log("Attribution selon la base sélectionnée:", origin);
        }
        // Sinon, essayer de déterminer en fonction de la table depuis laquelle il a été sélectionné
        else if (equipment._source) {
          origin = equipment._source;
          console.log("Attribution selon la source:", origin);
        }
        // Pour les cas où nous n'avons pas cette information, faire notre meilleur effort
        else {
          // Pour les imprimantes, attribuer à Techno 1 (bien qu'elles existent dans les deux bases)
          if (equipment.modele && equipment.modele.startsWith("Z")) {
            origin = "Techno 1";
            console.log("Attribution par défaut à Techno 1 pour l'imprimante", equipment.modele);
          }
          // Pour les PDAs, attribution arbitraire
          else if (equipment.modele && equipment.modele.includes("MC")) {
            // Attribution arbitraire basée sur l'IP, mais comme elles existent aussi dans les deux bases...
            if (equipment.ipadresse === "10.0.0.213") {
              origin = "Techno 1";
            } else {
              origin = "Techno 2";
            }
            console.log("Attribution par défaut pour le PDA", equipment.modele, "vers", origin);
          }
        }
      }
      
      console.log("Base d'origine déterminée:", origin);
      
      // Stocker l'origine avec l'équipement sélectionné
      selectedEquipment.value = { ...equipment, origin };
    }
  } catch (error) {
    console.error("Erreur lors de l'ouverture des détails:", error);
    // En cas d'erreur, on affiche quand même les détails
    selectedEquipment.value = { ...equipment, origin: "Inconnue" };
  }
};



// Fermer la fenêtre modale
const closeModal = () => {
  console.log("Fermeture de la modale");
  selectedEquipment.value = null;
};

// Classe CSS pour la disponibilité
const getAvailabilityClass = (disponibilite) => {
  return disponibilite ? 'available' : 'unavailable';
};
</script>

<style scoped>
/* Styles pour la disponibilité */
.available {
  color: #10b981; /* Vert */
  font-weight: bold;
}

.unavailable {
  color: #ef4444; /* Rouge */
  font-weight: bold;
}

/* Styles pour les badges de statut dans les détails */
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.status-badge.available {
  background-color: rgba(16, 185, 129, 0.1); /* Fond vert clair */
  border: 1px solid #10b981;
}

.status-badge.unavailable {
  background-color: rgba(239, 68, 68, 0.1); /* Fond rouge clair */
  border: 1px solid #ef4444;
}

/* Styles généraux */
.container {
  font-family: 'Roboto', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9fafb;
}

.search-bar input {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: border-color 0.3s ease;
  margin-bottom: 20px;
}

.search-bar input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border-radius: 8px;
}

.styled-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.styled-table th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
  text-align: left;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  position: sticky;
  top: 0;
}

.styled-table th:hover {
  background-color: #0056b3;
}

.styled-table td {
  padding: 15px;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
}

.styled-table tr:hover td {
  background-color: #f8f9fa;
}

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

.details-button {
  padding: 8px 16px;
  font-size: 14px;
  color: white;
  background-color: #3b82f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  z-index: 10;
  position: relative;
}

.details-button:hover {
  background-color: rgb(40, 33, 136);
}

.origin-indicator {
  background-color: #f0f4f8;
  padding: 8px 16px;
  border-bottom: 1px solid #e1e4e8;
  font-size: 14px;
  color: #555;
}

.origin-name {
  font-weight: bold;
  color: #3498db;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #e3f2fd;
}

.techno1 {
  background-color: #e3f7ed;
  color: #16a34a;
}

.techno2 {
  background-color: #ebf5ff;
  color: #2563eb;
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
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 90%;
  overflow: hidden;
}

.modal-header {
  background-color: #007bff;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 20px;
}

.info-section {
  margin-bottom: 30px;
}

.info-section h3 {
  color: #007bff;
  margin-bottom: 15px;
  font-size: 18px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-label {
  color: #6b7280;
  font-size: 14px;
}

.info-value {
  color: #1f2937;
  font-size: 16px;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.available {
  background-color: #4CAF50;
  color: red;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
}

.unavailable {
  background-color: #F44336;
  color: red;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
}

.enterprise-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.techno1-badge {
  background-color: #4C6EF5 !important; /* Bleu pour Techno 1 */
}

.techno2-badge {
  background-color: #7048E8 !important; /* Violet pour Techno 2 */
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 30px;
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}
</style>