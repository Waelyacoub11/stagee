<template>
  <div class="pie-chart">
    <div class="chart-header">
      <h3>tickets</h3>
    </div>
    <canvas ref="chartTicketCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { Chart } from "chart.js/auto";
import axios from "axios";

const chartTicketCanvas = ref(null);
let chartInstance = null;

const props = defineProps({
  selectedBase: String,
});

watch(
  () => props.selectedBase,
  async (newBase) => {
    // console.log("test", newBase);
    if (newBase) {
      const stats = await fetchStats(newBase);
      if (stats) {
        initializeChart(stats);
      }
    }
  },
  { immediate: true }
);

const fetchStats = async () => {
  try {
    const storedToken = sessionStorage.getItem("token");
    if (!storedToken) {
      console.error("Aucun token disponible dans le sessionStorage");
      return null;
    }

    const response = await axios.post(
      "http://localhost:5000/api/tickets/stat",
      {},
      {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      }
    );

    //console.log("Statistiques tickets récupérées :", response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques :", error);
    return null;
  }
};

const initializeChart = (stats) => {
  if (chartInstance) {
    chartInstance.destroy();
  }

  let priorities = [];
  let values = [];

  if (props.selectedBase === "techno1" && stats.priorityStats.techno1) {
    priorities = Object.keys(stats.priorityStats.techno1) || [];
    values = Object.values(stats.priorityStats.techno1) || [];
  } else if (props.selectedBase === "techno2" && stats.priorityStats.techno2) {
    priorities = Object.keys(stats.priorityStats.techno2) || [];
    values = Object.values(stats.priorityStats.techno2) || [];
  } else if (stats.priorityStats.all) {
    priorities = Object.keys(stats.priorityStats.all) || [];
    values = Object.values(stats.priorityStats.all) || [];
  }

  if (priorities.length === 0) {
    priorities = ["Aucune donnée disponible"];
    values = [1];
  }

  chartInstance = new Chart(chartTicketCanvas.value, {
    type: "pie",
    data: {
      labels: priorities,
      datasets: [
        {
          label: "Nombre de tickets par priorité",
          data: values,
          backgroundColor: [
            "#FF6384", // High priority
            "#36A2EB", // Medium priority
            "#FFCE56", // Low priority
          ],
          hoverBackgroundColor: ["#FF6384AA", "#36A2EBAA", "#FFCE56AA"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.raw} tickets`,
          },
        },
      },
    },
  });
};

onMounted(async () => {
  const stats = await fetchStats();
  if (stats) {
    initializeChart(stats);
  }
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style scoped>
.pie-chart {
  max-width: 200px;
  margin: 0 auto;
  text-align: center;
}

.chart-header h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}
</style>
