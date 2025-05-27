<template>
  <div class="app-container">
    <main class="main-content">
      <div class="alerts-page p-6 space-y-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Toutes les alertes</h1>

    <!-- Section Alertes critiques -->
    <section>
      <h2 class="text-3xl font-bold text-red-600 mb-6 flex items-center gap-2">
        🚨 Alertes critiques
      </h2>
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des alertes...</p>
      </div>
      <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8">
        <p class="font-bold">Erreur de chargement</p>
        <p>{{ error }}</p>
        <button @click="fetchAlerts" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Réessayer
        </button>
      </div>
      <div v-else-if="erreurs.length === 0" class="text-center py-8 text-gray-500">
        Aucune alerte critique à afficher
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="alert in erreurs"
          :key="alert.id"
          class="flex flex-col items-start bg-white p-4 rounded-xl shadow-lg transition-all duration-500 ease-in-out border-l-4 border-red-600 relative"
        >
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
              <div class="mb-1">
                <span class="mr-2">IP :</span>
                <span>{{ alert.ipadresse || "IP inconnue" }}</span>
              </div>
              <div>
                <span class="mr-2">Entreprise :</span>
                <span class="enterprise-badge" :class="{'techno1-badge': alert.source === 'Techno 1', 'techno2-badge': alert.source === 'Techno 2'}">
                  {{ alert.source || 'Non spécifiée' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Avertissements -->
    <section>
      <h2 class="text-3xl font-bold text-yellow-600 mb-6 flex items-center gap-2">
        ⚠️ Avertissements
      </h2>
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des avertissements...</p>
      </div>
      <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8">
        <p class="font-bold">Erreur de chargement</p>
        <p>{{ error }}</p>
      </div>
      <div v-else-if="avertissements.length === 0" class="text-center py-8 text-gray-500">
        Aucun avertissement à afficher
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="alert in avertissements"
          :key="alert.id"
          class="flex flex-col items-start bg-white p-4 rounded-xl shadow-lg transition-all duration-500 ease-in-out border-l-4 border-yellow-500 relative"
        >
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
              <div class="mb-1">
                <span class="mr-2">IP :</span>
                <span>{{ alert.ipadresse || "IP inconnue" }}</span>
              </div>
              <div>
                <span class="mr-2">Entreprise :</span>
                <span class="enterprise-badge" :class="{'techno1-badge': alert.source === 'Techno 1', 'techno2-badge': alert.source === 'Techno 2'}">
                  {{ alert.source || 'Non spécifiée' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Variables d'état
const erreurs = ref([]);
const avertissements = ref([]);
const loading = ref(true);
const error = ref(null);

// Récupérer les alertes des deux bases
const fetchAlerts = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const storedToken = sessionStorage.getItem("token");

    if (!storedToken) {
      error.value = "Aucun token disponible dans le sessionStorage";
      loading.value = false;
      return;
    }

    // Récupérer les alertes des deux bases
    const response = await axios.get(
      "http://localhost:5000/api/alerts",
      {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      }
    );

    console.log("Réponse des alertes:", response.data);

    if (response.data) {
      // Traiter les alertes de Techno 1
      if (Array.isArray(response.data.techno1)) {
        response.data.techno1.forEach(alert => {
          alert.source = 'Techno 1';
          
          // Déterminer si c'est une erreur ou un avertissement
          if (alert.statut === 'erreur') {
            erreurs.value.push(alert);
          } else if (alert.statut === 'avertissement') {
            avertissements.value.push(alert);
          }
        });
      }
      
      // Traiter les alertes de Techno 2
      if (Array.isArray(response.data.techno2)) {
        response.data.techno2.forEach(alert => {
          alert.source = 'Techno 2';
          
          // Déterminer si c'est une erreur ou un avertissement
          if (alert.statut === 'erreur') {
            erreurs.value.push(alert);
          } else if (alert.statut === 'avertissement') {
            avertissements.value.push(alert);
          }
        });
      }
    }
  } catch (err) {
    console.error("Erreur lors de la récupération des alertes:", err);
    error.value = `Erreur lors de la récupération des alertes: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

// Formater les dates
const formatDate = (dateStr) => {
  if (!dateStr) return "Date inconnue";
  
  const date = new Date(dateStr);
  return date.toLocaleString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Charger les alertes au montage du composant
onMounted(() => {
  fetchAlerts();
});
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background-color: #fff;
  position: relative;
  padding: 0;
  margin: 0;
  margin-left: 250px; /* Largeur de la sidebar */
}

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #fff;
  min-height: 100vh;
  overflow-y: auto;
  width: calc(100% - 250px); /* Largeur totale moins la sidebar */
  box-sizing: border-box;
}

.enterprise-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.techno1-badge {
  background-color: #4C6EF5;
}

.techno2-badge {
  background-color: #7048E8;
}
</style>
