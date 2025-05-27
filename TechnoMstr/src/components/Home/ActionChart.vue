<template>
  <div class="donut-chart">
    <div class="chart-header">
      <h3>Types d'équipements</h3>
    </div>
    <canvas ref="chartActionCanvas"></canvas>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { Chart } from "chart.js/auto";
import axios from "axios";
import { useRouter } from 'vue-router';

const chartActionCanvas = ref(null);
let chartInstance = null;
const router = useRouter();

const props = defineProps({
  selectedBase: String,
});

// Fonction pour naviguer vers la page des équipements
const navigateToEquipements = () => {
  router.push({
    name: 'Equipements'
  });
};

const fetchStats = async () => {
  try {
    // Récupérer le token depuis sessionStorage ou localStorage
    const storedToken = sessionStorage.getItem("token") || localStorage.getItem("token");
    
    console.log("Début de fetchStats dans ActionChart");
    console.log("Base sélectionnée:", props.selectedBase);
    console.log("Token disponible:", !!storedToken);
    
    if (!storedToken) {
      console.error("Aucun token disponible dans le sessionStorage ou localStorage");
      return null;
    }

    // Utiliser l'API réelle des équipements
    const response = await axios.get(
      "http://localhost:5000/api/equipements",
      {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      }
    );

    console.log("Réponse de l'API des équipements:", response.data);
    
    // Analyser les données pour compter les imprimantes (modèle commencant par Z) et les PDA
    const result = {};
    
    // Fonction pour classifier les équipements
    const processEquipments = (equipments, baseKey) => {
      if (!Array.isArray(equipments)) return { imprimantes: 0, pdas: 0 };
      
      const imprimantes = equipments.filter(e => 
        e.modele && e.modele.toString().startsWith('Z')
      ).length;
      
      const pdas = equipments.filter(e => 
        e.modele && !e.modele.toString().startsWith('Z')
      ).length;
      
      return { imprimantes, pdas };
    };
    
    // Traiter les données de chaque base
    if (response.data.techno1) {
      result.techno1 = processEquipments(response.data.techno1, 'techno1');
    }
    
    if (response.data.techno2) {
      result.techno2 = processEquipments(response.data.techno2, 'techno2');
    }
    
    // Ajouter les totaux pour simplifier
    result.total = {
      imprimantes: (result.techno1?.imprimantes || 0) + (result.techno2?.imprimantes || 0),
      pdas: (result.techno1?.pdas || 0) + (result.techno2?.pdas || 0)
    };
    
    console.log("Données traitées des types d'équipements:", result);
    return result;
    
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    
    // En cas d'erreur, renvoyer des données minimales pour ne pas avoir un graphique vide
    const fallbackData = {
      techno1: {
        imprimantes: 1,
        pdas: 2
      },
      techno2: {
        imprimantes: 1,
        pdas: 2
      },
      total: {
        imprimantes: 2,
        pdas: 4
      }
    };
    
    console.log("Données de secours utilisées:", fallbackData);
    return fallbackData;
  }
};

const createChart = (stats) => {
  console.log("Début de createChart");
  console.log("Stats reçues:", stats);
  
  if (!chartActionCanvas.value) {
    console.error("Canvas element not found");
    return;
  }

  if (chartInstance) {
    chartInstance.destroy(); // Détruit l'instance précédente
  }

  const labels = ["Imprimantes", "PDAs"];
  const colors = ["#36A2EB", "#FF6384"];

  let imprimantes = 0;
  let pdas = 0;

  // Logique de filtrage similaire à TicketChart.vue
  if (props.selectedBase === "techno1" && stats.techno1) {
    imprimantes = stats.techno1.imprimantes || 0;
    pdas = stats.techno1.pdas || 0;
    console.log("Affichage des données Techno 1:", { imprimantes, pdas });
  } 
  else if (props.selectedBase === "techno2" && stats.techno2) {
    imprimantes = stats.techno2.imprimantes || 0;
    pdas = stats.techno2.pdas || 0;
    console.log("Affichage des données Techno 2:", { imprimantes, pdas });
  }
  else {
    // Si aucune base sélectionnée ou toutes les bases
    if (stats.total) {
      imprimantes = stats.total.imprimantes || 0;
      pdas = stats.total.pdas || 0;
      console.log("Affichage des données totales:", { imprimantes, pdas });
    } else {
      // Fallback au cas où total n'existe pas
      if (stats.techno1) {
        imprimantes += stats.techno1.imprimantes || 0;
        pdas += stats.techno1.pdas || 0;
      }
      if (stats.techno2) {
        imprimantes += stats.techno2.imprimantes || 0;
        pdas += stats.techno2.pdas || 0;
      }
      console.log("Affichage des données calculées:", { imprimantes, pdas });
    }
  }

  const dataStat = [imprimantes, pdas];

  chartInstance = new Chart(chartActionCanvas.value, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          label: "Types d'équipements",
          data: dataStat,
          backgroundColor: colors,
        },
      ],
    },
    options: {
      responsive: true,
      onClick: (event, elements) => {
        // Rediriger vers la page des équipements quand on clique sur le graphique
        if (elements.length > 0) {
          navigateToEquipements();
        }
      },
      plugins: {
        legend: {
          position: "bottom",
          onClick: (e, legendItem) => {
            // Rediriger vers la page des équipements quand on clique sur la légende
            navigateToEquipements();
          },
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
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            },
            footer: function(tooltipItems) {
              return 'Cliquez pour voir les équipements';
            }
          }
        }
      },
    },
  });
};

watch(
  () => props.selectedBase,
  async (newBase) => {
    console.log("Base sélectionnée changée:", newBase);
    if (chartActionCanvas.value) {
      try {
        const stats = await fetchStats();
        console.log("Stats après changement de base:", stats);
        
        if (stats) {
          createChart(stats);
        } else {
          console.error("Les statistiques n'ont pas pu être récupérées.");
        }
      } catch (error) {
        console.error("Erreur lors du changement de base:", error);
      }
    }
  },
  { immediate: true }
);

onMounted(async () => {
  console.log("ActionChart monté");
  console.log("Canvas disponible:", !!chartActionCanvas.value);
  
  if (chartActionCanvas.value) {
    try {
      const stats = await fetchStats();
      console.log("Stats après fetchStats:", stats);
      
      if (stats) {
        createChart(stats);
      } else {
        console.error("Les statistiques n'ont pas pu être récupérées.");
      }
    } catch (error) {
      console.error("Erreur lors du montage du composant:", error);
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
