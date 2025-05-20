<!-- src/views/Home.vue -->
<template>
  <div
    v-if="isAuthenticated"
    class="home-page p-6 space-y-12 bg-gray-50 min-h-screen relative"
  >
    <!-- Toast notifications -->
    <div v-if="showToast" class="fixed top-4 right-4 z-50">
      <div
        class="flex items-center bg-red-500 text-white p-4 rounded-lg shadow-lg animate-pulse"
      >
        <span class="mr-2">🚨</span>
        <span>Nouvelle alerte critique détectée !</span>
      </div>
    </div>

    <!-- Header avec sélection et bienvenue -->
    <div class="flex justify-between items-start mb-8">
      <!-- Sélection d'entreprise à gauche -->
      <div class="w-64">
        <label class="block text-lg font-semibold mb-2"
          >Sélectionner une entreprise :</label
        >
        <select
          v-model="selectedBase"
          class="p-2 border rounded w-full shadow-sm"
        >
          <option disabled value="">-- Choisir une entreprise --</option>
          <option v-for="base in availableBases" :key="base" :value="base">
            {{ base }}
          </option>
        </select>
      </div>

      <div
        class="text-right bg-gray-50 p-4 rounded-xl shadow-md max-w-md ml-auto"
      >
        <h1 class="text-2xl font-bold text-gray-900">
          Bienvenue, {{ username }}
        </h1>
      </div>
    </div>

    <!-- Section État des Équipements -->
    

    <!-- Contenu après sélection -->
    <div v-if="selectedBase" class="space-y-12">
      <!-- Alertes critiques -->
      <section>
        <h2
          class="text-3xl font-bold text-red-600 mb-6 flex items-center gap-2"
        >
          🚨 Alertes critiques
        </h2>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6"
        >
          <transition-group name="fade">
            <div
              v-for="alert in filteredAlerts('erreur')"
              :key="alert.id"
              class="flex flex-col items-start bg-white p-4 rounded-xl shadow-lg transition-all duration-500 ease-in-out border-l-4 border-red-600 relative"
            >
              <!-- Badge "NEW" pour les nouvelles alertes -->
              <div v-if="alert.isNew" class="new-badge">NEW</div>

              <div>
                <div class="text-xl text-red-600 mb-2">❌</div>
                <h3 class="font-bold text-xs text-red-800 mb-2">
                  {{ alert.modele || 'Équipement inconnu' }}
                </h3>
                <p class="text-sm text-gray-800 mb-2">
                  {{ alert.description || "Aucune description disponible." }}
                </p>
                <div class="flex flex-col mt-auto text-xs text-gray-500">
                  <div class="mb-1">
                    <span class="mr-2">Date :</span>
                    <span>{{ formatDate(alert.date) }}</span>
                  </div>
                  <div>
                    <span class="mr-2">IP :</span>
                    <span>{{ alert.ipadresse || "IP inconnue" }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </section>

      <!-- Avertissements -->
      <section>
        <h2
          class="text-3xl font-bold text-yellow-600 mb-6 flex items-center gap-2"
        >
          ⚠️ Avertissements
        </h2>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6"
        >
          <transition-group name="fade">
            <div
              v-for="alert in filteredAlerts('avertissement')"
              :key="alert.id"
              class="flex flex-col items-start bg-white p-4 rounded-xl shadow-lg transition-all duration-500 ease-in-out border-l-4 border-yellow-500 relative"
            >
              <!-- Badge "NEW" pour les nouvelles alertes -->
              <div v-if="alert.isNew" class="new-badge">NEW</div>

              <div>
                <div class="text-xl text-yellow-500 mb-2">⚠️</div>
                <h3 class="font-bold text-xs text-yellow-800 mb-2">
                  {{ alert.modele || 'Équipement inconnu' }}
                </h3>
                <p class="text-sm text-gray-800 mb-2">
                  {{ alert.description || "Aucune description disponible." }}
                </p>
                <div class="flex flex-col mt-auto text-xs text-gray-500">
                  <div class="mb-1">
                    <span class="mr-2">Date :</span>
                    <span>{{ formatDate(alert.date) }}</span>
                  </div>
                  <div>
                    <span class="mr-2">IP :</span>
                    <span>{{ alert.ipadresse || "IP inconnue" }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </section>
    </div>

    <!-- SECTION GRAPHIQUES MISE À JOUR -->
    <section class="mb-12">
  <h2 class="text-3xl font-bold text-gray-800 mb-6">
    Tableau de bord
  </h2>
  
  <div v-if="chartsLoading" class="text-center py-4">
    <div
      class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"
    ></div>
    <p class="mt-2 text-gray-600">Chargement des graphiques...</p>
  </div>
  
  <div v-else-if="chartsError" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8">
    <p class="font-bold">Erreur de chargement</p>
    <p>{{ chartsError }}</p>
    <button @click="reloadCharts" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      Réessayer
    </button>
  </div>
  
  <div v-else>
    <div class="bg-white p-6 rounded-lg shadow-lg">
      <div class="space-y-6">
        <!-- Première rangée avec les 3 graphiques principaux -->
        <div class="grid grid-cols-3 gap-6">
          <!-- Première colonne: graphique 1 et graphique 4 empilés -->
          <div class="space-y-6">
        <!-- Graphique 1 -->
        <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-64">
          <ErrorBoundary :key="'equipement-' + chartReloadKey">
            <template #default>
              <EquipementChart :selectedBase="selectedBase" />
            </template>
            <template #fallback="{ error }">
              <div class="p-4 bg-red-50 text-red-600 rounded-lg h-full flex flex-col items-center justify-center">
                <p class="font-semibold">Erreur de chargement du graphique des équipements</p>
                <small>{{ error.message }}</small>
              </div>
            </template>
          </ErrorBoundary>
        </div>
        
        <!-- Graphique 4 -->
        <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-64">
          <ErrorBoundary :key="'alert-' + chartReloadKey">
            <template #default>
              <AlertChart :selectedBase="selectedBase" />
            </template>
            <template #fallback="{ error }">
              <div class="p-4 bg-red-50 text-red-600 rounded-lg h-full flex flex-col items-center justify-center">
                <p class="font-semibold">Erreur de chargement du graphique des alertes</p>
                <small>{{ error.message }}</small>
              </div>
            </template>
          </ErrorBoundary>
        </div>
      </div>
      
      <!-- Graphique 2 -->
      <div class="space-y-6">
        <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-64">
          <ErrorBoundary :key="'ticket-' + chartReloadKey">
            <template #default>
              <TicketChart :selectedBase="selectedBase" />
            </template>
            <template #fallback="{ error }">
              <div class="p-4 bg-red-50 text-red-600 rounded-lg h-full flex flex-col items-center justify-center">
                <p class="font-semibold">Erreur de chargement du graphique des tickets</p>
                <small>{{ error.message }}</small>
              </div>
            </template>
          </ErrorBoundary>
        </div>

        <!-- Graphique des tickets par statut (Résolu/Ouvert) -->
        <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-64 mt-6">
          <ErrorBoundary :key="'ticket-status-' + chartReloadKey">
            <template #default>
              <TicketStatusChart :selectedBase="selectedBase" :role="role" />
            </template>
            <template #fallback="{ error }">
              <div class="p-4 bg-red-50 text-red-600 rounded-lg h-full flex flex-col items-center justify-center">
                <p class="font-semibold">Erreur de chargement du graphique des statuts de tickets</p>
                <small>{{ error.message }}</small>
              </div>
            </template>
          </ErrorBoundary>
        </div>
        

      </div>
      
          <!-- Graphique 3 -->
          <div class="space-y-6">
            <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-64">
              <ErrorBoundary :key="'action-' + chartReloadKey">
                <template #default>
                  <ActionChart :selectedBase="selectedBase" />
                </template>
                <template #fallback="{ error }">
                  <div class="p-4 bg-red-50 text-red-600 rounded-lg h-full flex flex-col items-center justify-center">
                    <p class="font-semibold">Erreur de chargement du graphique des actions</p>
                    <small>{{ error.message }}</small>
                  </div>
                </template>
              </ErrorBoundary>
            </div>
            
            <!-- Graphique des utilisateurs -->
            <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-64">
              <ErrorBoundary :key="'users-' + chartReloadKey">
                <template #default>
                  <UsersChart :selectedBase="selectedBase" :role="role" />
                </template>
                <template #fallback="{ error }">
                  <div class="p-4 bg-red-50 text-red-600 rounded-lg h-full flex flex-col items-center justify-center">
                    <p class="font-semibold">Erreur de chargement du graphique des utilisateurs</p>
                    <small>{{ error.message }}</small>
                  </div>
                </template>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
      
      
    </div>
  </div>
</section>

  </div>
</template>

<script setup>
import EquipementChart from "./EquipementChart.vue";
import ActionChart from "./ActionChart.vue";
import AlertChart from "./AlertChart.vue";
import TicketChart from "./TicketChart.vue";
import TicketStatusChart from "./TicketStatusChart.vue";
import ErrorBoundary from "./ErrorBoundary.vue";

import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
import { io } from "socket.io-client";
import UsersChart from "./UsersChart.vue";

const router = useRouter();
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Composants
const components = {
  UsersChart,
  TicketStatusChart
};
const username = computed(() => authStore.user?.username || "Utilisateur");
const role = computed(() => authStore.user?.role || "Rôle");
const equipments = ref({});
const selectedTechno = ref(""); // Laisser vide initialement
const selectedBase = ref(""); // Ajout de la sélection d'entreprise
const isLoadingEquipments = ref(false);
const chartsLoading = ref(true);
const chartsError = ref(null);
const chartReloadKey = ref(0);

// Fonction pour recharger les graphiques
const reloadCharts = () => {
  chartsError.value = null;
  chartsLoading.value = true;
  chartReloadKey.value++;
  
  // Simuler un chargement
  setTimeout(() => {
    chartsLoading.value = false;
  }, 1000);
};

// Récupérer les équipements
const fetchEquipments = async () => {
  try {
    isLoadingEquipments.value = true;
    const response = await axios.get("http://localhost:5000/api/equipements");
    equipments.value = response.data;

    // Sélectionner la première technologie par défaut si elle existe
    const technoNames = Object.keys(response.data);
    if (technoNames.length > 0 && !selectedTechno.value) {
      selectedTechno.value = technoNames[0];
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des équipements:", error);
  } finally {
    isLoadingEquipments.value = false;
  }
};
// Logique de filtrage des équipements en fonction du rôle
const filteredEquipments = computed(() => {
  if (!selectedTechno.value || !equipments.value[selectedTechno.value]) {
    return [];
  }

  let techEquipments = [];

  // Gestion des rôles
  if (role.value === "globaladmin") {
    const techno1Equipments = equipments.value["techno1"] || [];
    const techno2Equipments = equipments.value["techno2"] || [];
    techEquipments = [...techno1Equipments, ...techno2Equipments];
  } else if (role.value === "superadmin1") {
    selectedTechno.value = "techno1";
    techEquipments = equipments.value["techno1"] || [];
    if (selectedBase.value) {
      techEquipments = techEquipments.filter(
        (equip) =>
          equip.nomparc === selectedBase.value ||
          equip.entreprise === selectedBase.value
      );
    }
  } else if (role.value === "superadmin2") {
    selectedTechno.value = "techno2";
    techEquipments = equipments.value["techno2"] || [];
  }

  // Ne pas filtrer les indisponibles ici - juste exclure maintenance/null
  techEquipments = techEquipments.filter((equip) => {
    const disp = equip.disponibilite;
    return disp !== "maintenance" && disp !== null && disp !== "null";
  });

  return techEquipments;
});

// Calculer les statistiques
const equipmentStats = computed(() => {
  const techEquipments = filteredEquipments.value;

  const stats = {
    available: 0,
    unavailable: 0,
    total: techEquipments.length,
  };

  techEquipments.forEach((equip) => {
    const disp = equip.disponibilite;

    // Gestion exhaustive des cas possibles
    if (disp === true || disp === "true" || disp === "Available") {
      stats.available++;
    } else if (disp === false || disp === "false" || disp === "Unavailable") {
      stats.unavailable++;
    }
    // Les cas null/maintenance ont déjà été filtrés
  });

  console.log("Statistiques:", {
    equipments: techEquipments,
    stats,
  });

  return stats;
});

// Vérifier l'authentification au montage du composant
onMounted(() => {
  if (!isAuthenticated.value) {
    router.push("/login");
    return;
  }
});

const allAlerts = ref({});

const socket = ref(null);
const showToast = ref(false);
const newAlerts = ref(new Set());

const availableBases = computed(() => {
  return Object.keys(allAlerts.value);
});

// Action déclenchée lors du changement de sélection
watch(selectedBase, (newBase) => {
  if (newBase) {
    console.log(`Entreprise sélectionnée : ${newBase}`);
  }
});

const filteredAlerts = (statut) => {
  if (!selectedBase.value || !allAlerts.value[selectedBase.value]) return [];

  const sortedAlerts = allAlerts.value[selectedBase.value]
    .filter((alert) => alert.statut.toLowerCase() === statut.toLowerCase())
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const dateSort = dateB - dateA;

      if (dateA.getTime() === dateB.getTime()) {
        return b.id - a.id;
      }

      return dateSort;
    });

  return sortedAlerts;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleNewAlert = (alertData) => {
  const base = alertData.source;
  const statut = alertData.statut?.toLowerCase();
  const equipId = alertData.idequipement;

  if (!allAlerts.value[base]) {
    allAlerts.value[base] = [];
  }

  if (statut !== "erreur" && statut !== "avertissement") {
    allAlerts.value[base] = allAlerts.value[base].filter(
      (alert) => alert.idequip !== equipId
    );
    return;
  }

  const exists = allAlerts.value[base].some(
    (existingAlert) => existingAlert.id === alertData.id
  );

  if (!exists) {
    alertData.isNew = true;
    newAlerts.value.add(alertData.id);
    allAlerts.value[base].unshift(alertData);

    setTimeout(() => {
      removeNewBadge(alertData.id);
    }, 5000);
  }
};

const removeNewBadge = (alertId) => {
  Object.keys(allAlerts.value).forEach((base) => {
    const alertIndex = allAlerts.value[base].findIndex(
      (alert) => alert.id === alertId
    );
    if (alertIndex !== -1) {
      allAlerts.value[base][alertIndex].isNew = false;
      newAlerts.value.delete(alertId);
    }
  });
};

const fetchAlerts = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/alerts");

    if (allAlerts.value) {
      Object.keys(response.data).forEach((base) => {
        if (response.data[base] && allAlerts.value[base]) {
          response.data[base].forEach((newAlert) => {
            const exists = allAlerts.value[base].some(
              (existingAlert) => existingAlert.id === newAlert.id
            );

            if (!exists) {
              newAlert.isNew = true;
              newAlerts.value.add(newAlert.id);

              setTimeout(() => {
                removeNewBadge(newAlert.id);
              }, 5000);
            } else {
              const existingAlert = allAlerts.value[base].find(
                (alert) => alert.id === newAlert.id
              );
              if (existingAlert && existingAlert.isNew) {
                newAlert.isNew = true;
              }
            }
          });
        }
      });
    }

    allAlerts.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des alertes :", error);
  }
};

onMounted(() => {
  if (!isAuthenticated.value) {
    router.push("/login");
    return;
  }

  socket.value = io("http://localhost:5000");

  socket.value.on("connect", () => {
    console.log("✅ WebSocket connecté");
  });

  socket.value.on("nouvelle-alerte", (alertData) => {
    console.log("Nouvelle alerte reçue:", alertData);
    handleNewAlert(alertData);

    if (alertData.statut.toLowerCase() === "erreur") {
      showToast.value = true;
      setTimeout(() => {
        showToast.value = false;
      }, 5000);
    }

    if (alertData.statut.toLowerCase() === "erreur") {
      const audio = new Audio("/path/to/alert-sound.mp3");
      audio.play().catch(err => {
        console.warn("Impossible de jouer le son d'alerte:", err);
      });
    }
  });

  fetchAlerts();
  setInterval(fetchAlerts, 2000);
  fetchEquipments();
  
  // Initier le chargement des graphiques
  setTimeout(() => {
    try {
      chartsLoading.value = false;
    } catch (error) {
      chartsError.value = "Erreur lors du chargement des graphiques. Veuillez réessayer.";
      chartsLoading.value = false;
    }
  }, 1000);
});
</script>

<style lang="scss" scoped>
.home-page {
  width: 102%;
  padding: 1rem;
  padding-left: calc(2rem + 48px);
  box-sizing: border-box;
  transition: padding-left 0.2s ease-out;

  &.sidebar-expanded {
    padding-left: calc(var(--sidebar-width) + 1rem);
  }
}

/* Animation d'apparition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Badge "NEW" pour les nouvelles alertes */
.new-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: red;
  color: white;
  font-weight: bold;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 10;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

.username {
  font-size: 24px;
  font-weight: bold;
  color: #111827;
}

.role {
  color: #6b7280;
  font-size: 16px;
  margin-top: 4px;
}

/* Styles pour la disposition des graphiques */
.charts-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.charts-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.chart-col {
  flex: 1;
  min-width: 300px;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.bottom-chart {
  margin-top: 30px;
}

/* Style d'erreur pour les graphiques */
.chart-error {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.chart-error p {
  font-weight: bold;
  color: #b91c1c;
  margin-bottom: 8px;
}

.chart-error small {
  color: #7f1d1d;
}

/* Responsive design pour les petits écrans */
@media (max-width: 992px) {
  .chart-col {
    flex: 1 1 100%;
    max-width: 100%;
  }
  
  .bottom-chart {
    margin-top: 40px;
  }
}
</style>