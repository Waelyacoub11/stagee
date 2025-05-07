<template>
  <div class="donut-chart">
    <div class="chart-header">
      <h3> Actions</h3>
    </div>
    <canvas ref="chartActionCanvas"></canvas>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Chart } from "chart.js/auto";
import axios from "axios";

const chartActionCanvas = ref(null);
let chartInstance = null;

const fetchStats = async () => {
  try {
    const storedToken = sessionStorage.getItem("token");
    if (!storedToken) {
      console.error("Aucun token disponible dans le sessionStorage");
      return null;
    }

    const response = await axios.post(
      "http://localhost:3000/api/actions/stat",
      {},
      {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      }
    );

    // console.log("Statistiques récupérées :", response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques :", error);
    return null;
  }
};

const createChart = (stats) => {
  if (!chartActionCanvas.value) {
    console.error("Canvas element not found");
    return;
  }

  if (chartInstance) {
    chartInstance.destroy(); // Détruit l'instance précédente
  }

  const labels = ["CONTRAST_CHANGE", "IP_CHANGE", "SPEED_CHANGE", "CUSTOM_COMMAND"];
  const colors = ["#ffcc00", "#00ccff", "#66ff66", "#ff6666"];

  const dataStat = labels.map((label) => stats.data?.tot[label] || 0);

  chartInstance = new Chart(chartActionCanvas.value, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          label: "Actions",
          data: dataStat,
          backgroundColor: colors,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
};

onMounted(async () => {
  if (chartActionCanvas.value) {
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
