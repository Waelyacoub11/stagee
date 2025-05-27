<template>
  <div class="donut-chart">
    <div class="chart-header">
      <h3>Tickets par statut</h3>
    </div>
    <canvas ref="chartTicketStatusCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { Chart } from "chart.js/auto";
import axios from "axios";
import { useRouter } from 'vue-router';

const chartTicketStatusCanvas = ref(null);
let chartInstance = null;
const router = useRouter();

const props = defineProps({
  selectedBase: String,
  role: {
    type: String,
    default: 'globaladmin' // Valeur par défaut si la propriété n'est pas passée
  }
});

const fetchStats = async () => {
  try {
    const storedToken = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!storedToken) {
      console.error("Aucun token disponible dans le sessionStorage");
      return null;
    }

    console.log("Récupération des statistiques de tickets par statut...");
    console.log("Role:", props.role);
    console.log("Base sélectionnée:", props.selectedBase);

    const response = await axios.post(
      "http://localhost:5000/api/tickets/stat-status",
      {
        selectedBase: props.selectedBase
      },
      {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 secondes
      }
    );

    console.log("Statistiques de tickets par statut récupérées:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques par statut:", error);
    return null;
  }
};

// Fonction pour naviguer vers la page des tickets
const navigateToTickets = () => {
  router.push({
    name: 'Tickets'
  });
};

const createChart = (stats) => {
  if (!chartTicketStatusCanvas.value) {
    console.error("Canvas element not found");
    return;
  }

  if (chartInstance) {
    chartInstance.destroy(); // Détruit l'instance précédente
  }

  // Déterminer quelles données utiliser en fonction du rôle et de la base sélectionnée
  let statusData = {};

  if (props.role === "globaladmin") {
    if (props.selectedBase && stats.statusStats[props.selectedBase]) {
      // Si une base spécifique est sélectionnée
      statusData = stats.statusStats[props.selectedBase];
    } else {
      // Sinon, utiliser les totaux
      statusData = stats.statusStats.tot;
    }
  } else if (props.role === "superadmin1") {
    // Superadmin1 ne voit que les statistiques de techno1
    statusData = stats.statusStats.techno1 || {};
  } else if (props.role === "superadmin2") {
    // Superadmin2 ne voit que les statistiques de techno2
    statusData = stats.statusStats.techno2 || {};
  } else {
    // Par défaut, utiliser les totaux
    statusData = stats.statusStats.tot || {};
  }

  console.log("Données utilisées pour le graphique:", statusData);

  const labels = Object.keys(statusData);
  const data = Object.values(statusData);

  // Couleurs pour les statuts: Vert pour "Résolu", Rouge pour "Ouvert"
  const colors = {
    "Résolu": "#4CAF50", // Vert
    "Ouvert": "#F44336", // Rouge
    "Inconnu": "#9E9E9E" // Gris
  };

  // Préparer les couleurs dans l'ordre des labels
  const backgroundColor = labels.map(label => colors[label] || "#9E9E9E");

  chartInstance = new Chart(chartTicketStatusCanvas.value, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Tickets par statut",
          data: data,
          backgroundColor: backgroundColor,
          hoverOffset: 4
        }
      ]
    },
    options: {
      responsive: true,
      onClick: (event, elements) => {
        // Vérifier si l'utilisateur a cliqué sur un élément du graphique
        if (elements.length > 0) {
          const index = elements[0].index;
          const label = chartInstance.data.labels[index];
          
          // Si l'utilisateur a cliqué sur la section "Ouvert", naviguer vers la page des tickets
          if (label === "Ouvert") {
            navigateToTickets();
          }
        }
      },
      plugins: {
        legend: {
          position: "bottom",
          onClick: (e, legendItem) => {
            // Si l'utilisateur clique sur la légende "Ouvert", naviguer vers la page des tickets
            if (chartInstance.data.labels[legendItem.index] === "Ouvert") {
              navigateToTickets();
            } else {
              // Comportement par défaut pour les autres légendes
              Chart.defaults.plugins.legend.onClick(e, legendItem, chartInstance);
            }
          },
          labels: {
            generateLabels: function(chart) {
              const dataset = chart.data.datasets[0];
              return chart.data.labels.map((label, index) => ({
                text: `${label} (${dataset.data[index]})`,
                fillStyle: dataset.backgroundColor[index],
                strokeStyle: dataset.backgroundColor[index],
                lineWidth: 1,
                index: index
              }));
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            },
            footer: function(tooltipItems) {
              // Ajouter une indication que le clic mène à la liste des tickets
              if (tooltipItems[0].label === "Ouvert") {
                return 'Cliquez pour voir les tickets';
              }
              return '';
            }
          }
        }
      }
    }
  });
};

watch(() => props.selectedBase, async () => {
  console.log("Base sélectionnée modifiée:", props.selectedBase);
  const stats = await fetchStats();
  if (stats) {
    createChart(stats);
  }
});

onMounted(async () => {
  console.log("Composant TicketStatusChart monté");
  if (chartTicketStatusCanvas.value) {
    const stats = await fetchStats();
    if (stats) {
      createChart(stats);
    } else {
      console.error("Les statistiques n'ont pas pu être récupérées.");
    }
  }
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
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
