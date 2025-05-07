<!-- src/components/Home/DonutChart.vue -->
<template>
  <div class="donut-chart">
      <div class="chart-header">
          <h3>Nombre total : {{ total }}</h3>
      </div>
      <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Chart } from "chart.js/auto";
import axios from "axios";
import { useAuthStore } from '@/stores/authStore'

const available = ref(0);
const unavailable = ref(0);
const chartInstance = ref(null);

const fetchEquipementDisponibilite = async () => {
  try {
      const storedToken = sessionStorage.getItem('token');
      if (!storedToken) {
          console.error('Aucun token disponible dans le sessionStorage');
          return;
      }
      
      // Correction: Placer les headers correctement dans la configuration de la requête
      const response = await axios.post(
          "http://localhost:3000/api/equipements/disponibilite", 
          {}, // Corps de la requête vide
          {
              headers: {
                  Authorization: `Bearer ${storedToken}`,
              },
          }
      );
      
      console.log("response ", response);
      
      // Initialiser les compteurs à zéro
      let techno1Disponibles = 0;
      let techno1NonDisponibles = 0;
      let techno2Disponibles = 0;
      let techno2NonDisponibles = 0;
      
      // Vérifier si les données techno1 existent dans la réponse
      if (response.data.techno1) {
          techno1Disponibles = response.data.techno1.disponibles?.length || 0;
          techno1NonDisponibles = response.data.techno1.nonDisponibles?.length || 0;
      }
      
      // Vérifier si les données techno2 existent dans la réponse
      if (response.data.techno2) {
          techno2Disponibles = response.data.techno2.disponibles?.length || 0;
          techno2NonDisponibles = response.data.techno2.nonDisponibles?.length || 0;
      }
      
      available.value = techno1Disponibles + techno2Disponibles;
      unavailable.value = techno1NonDisponibles + techno2NonDisponibles;
      
      // Mettre à jour le chart si déjà initialisé
      if (chartInstance.value) {
          updateChart();
      }
  } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
  }
};

const total = computed(() => available.value + unavailable.value);

const labels = ["Équipements disponibles", "Équipements non disponibles"];
const colors = ["#28a745", "#dc3545"];

const chartCanvas = ref(null);

// Fonction pour mettre à jour le graphique
const updateChart = () => {
  if (chartInstance.value) {
      chartInstance.value.data.datasets[0].data = [available.value, unavailable.value];
      chartInstance.value.update();
  }
};

onMounted(async () => {
  await fetchEquipementDisponibilite();
  
  chartInstance.value = new Chart(chartCanvas.value, {
      type: 'doughnut',
      data: {
          labels,
          datasets: [
              {
                  data: [available.value, unavailable.value],
                  backgroundColor: colors,
              },
          ],
      },
      options: {
          responsive: true,
          plugins: {
              legend: {
                  position: 'bottom',
                  labels: {
                      generateLabels: function (chart) {
                          const dataset = chart.data.datasets[0];
                          return chart.data.labels.map((label, index) => ({
                              text: `${label} (${dataset.data[index]})`, // Ajouter le nombre dans la légende
                              fillStyle: dataset.backgroundColor[index],
                              strokeStyle: dataset.borderColor ? dataset.borderColor[index] : dataset.backgroundColor[index],
                              lineWidth: 1,
                              index: index,
                          }));
                      },
                  },
              },
          },
      },
  });
});
</script>

<style scoped>
.donut-chart {
  max-width: 200px;
  margin: 0 auto;
  text-align: center;
}

.chart-header h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}
</style>