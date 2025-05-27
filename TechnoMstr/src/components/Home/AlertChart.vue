<template>
  <div class="alert-chart">
    <div class="chart-header">
      <h3>Alertes</h3>
    </div>
    <div class="chart-container" @click="navigateToAlertsPage">
      <canvas ref="alertCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { Chart } from "chart.js/auto";
import axios from "axios";
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const errors = ref(0);
const warnings = ref(0);
const chartInstance = ref(null);
const alertCanvas = ref(null);
const authStore = useAuthStore();
const router = useRouter();

const props = defineProps({
  selectedBase: String,
});

const fetchAlertsStatut = async () => {
  try {
    const storedToken = sessionStorage.getItem("token");

    if (!storedToken) {
      console.error("Aucun token disponible dans le sessionStorage");
      return;
    }

    // Envoyer l'entreprise sélectionnée dans la requête
    const response = await axios.post(
      "http://localhost:5000/api/alerts/statut",
      {
        selectedCompany: props.selectedBase
      },
      {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      }
    );

    console.log("response alerts: ", response);

    // Traiter les données directement depuis la structure simplifiée renvoyée par le backend
    if (response.data) {
      errors.value = response.data.erreurs?.length || 0;
      warnings.value = response.data.avertissements?.length || 0;
      
      // Mettre à jour le graphique si déjà initialisé
      if (chartInstance.value) {
        updateChart();
      }
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des alertes :", error);
  }
};

const total = computed(() => errors.value + warnings.value);

const alertLabels = ["Erreurs", "Avertissements"];
const alertColors = ["#dc3545", "#ffc107"];

// Fonction pour mettre à jour le graphique
const updateChart = () => {
  if (chartInstance.value) {
    chartInstance.value.data.datasets[0].data = [errors.value, warnings.value];
    chartInstance.value.update();
  }
};

// Fonction pour naviguer vers la page d'alertes
const navigateToAlertsPage = () => {
  router.push('/alerts');
};

// Observer les changements d'entreprise sélectionnée
watch(() => props.selectedBase, () => {
  fetchAlertsStatut();
});

onMounted(async () => {
  await fetchAlertsStatut();

  chartInstance.value = new Chart(alertCanvas.value, {
    type: "doughnut",
    data: {
      labels: alertLabels,
      datasets: [
        {
          data: [errors.value, warnings.value],
          backgroundColor: alertColors,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            generateLabels: function (chart) {
              const dataset = chart.data.datasets[0];
              return chart.data.labels.map((label, index) => ({
                text: `${label} (${dataset.data[index]})`,
                fillStyle: dataset.backgroundColor[index],
                strokeStyle: dataset.borderColor
                  ? dataset.borderColor[index]
                  : dataset.backgroundColor[index],
                lineWidth: 1,
                index: index,
              }));
            },
          },
        },
        tooltip: {
          callbacks: {
            footer: function() {
              return `Total: ${total.value}`;
            }
          }
        }
      },
    },
  });
});
</script>

<style scoped>
.alert-chart {
  max-width: 200px;
  margin: 0 auto;
  text-align: center;
}

.chart-header h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.chart-container {
  cursor: pointer;
  transition: transform 0.2s;
}

.chart-container:hover {
  transform: scale(1.05);
}
</style>