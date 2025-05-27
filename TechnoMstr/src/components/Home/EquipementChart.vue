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
import { ref, computed, onMounted, watch } from "vue";
import { Chart } from "chart.js/auto";
import axios from "axios";
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const available = ref(0);
const unavailable = ref(0);
const chartInstance = ref(null);
const router = useRouter();

const props = defineProps({
  selectedBase: String,
});

watch(() => props.selectedBase, () => {
  fetchEquipementDisponibilite();
});

const fetchEquipementDisponibilite = async () => {
  try {
    const storedToken = sessionStorage.getItem('token');
    if (!storedToken) {
      console.error('Aucun token disponible dans le sessionStorage');
      return;
    }

    const response = await axios.post(
      "http://localhost:5000/api/equipements/disponibilite", 
      {
        selectedBase: props.selectedBase
      },
      {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      }
    );
    
    console.log("response ", response);
    console.log("Données brutes de l'API:", JSON.stringify(response.data, null, 2));
    
    // Initialiser les compteurs à zéro
    let techno1Disponibles = 0;
    let techno1NonDisponibles = 0;
    let techno2Disponibles = 0;
    let techno2NonDisponibles = 0;
    
    // Si une compagnie est sélectionnée, utiliser uniquement ses données
    if (props.selectedBase && response.data[props.selectedBase]) {
      const companyData = response.data[props.selectedBase];
      const companyDisponibles = companyData.disponibles?.length || 0;
      const companyNonDisponibles = companyData.nonDisponibles?.length || 0;
      
      available.value = companyDisponibles;
      unavailable.value = companyNonDisponibles;
    } else {
      // Pour le globaladmin sans sélection d'entreprise
      let totalDisponibles = 0;
      let totalNonDisponibles = 0;

      // Parcourir toutes les entreprises dans la réponse
      for (const company in response.data) {
        if (response.data[company] && typeof response.data[company] === 'object') {
          const companyData = response.data[company];
          
          // Vérifier si les données sont déjà séparées en disponibles/nonDisponibles
          if (companyData.disponibles !== undefined && companyData.nonDisponibles !== undefined) {
            totalDisponibles += companyData.disponibles?.length || 0;
            totalNonDisponibles += companyData.nonDisponibles?.length || 0;
          } 
          // Si c'est un tableau d'équipements, les filtrer manuellement
          else if (Array.isArray(companyData)) {
            totalDisponibles += companyData.filter(e => e.disponibilite === true).length;
            totalNonDisponibles += companyData.filter(e => e.disponibilite === false || e.disponibilite === null).length;
          }
        }
      }
      
      available.value = totalDisponibles;
      unavailable.value = totalNonDisponibles;
      
      console.log(`Total - Disponibles: ${totalDisponibles}, Non disponibles: ${totalNonDisponibles}`);
    }
    
    // Mettre à jour le chart si déjà initialisé
    if (chartInstance.value) {
      updateChart();
    }
  } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
  }
};

const total = computed(() => available.value + unavailable.value);

const labels = ["Équipements disponibles", "Équipements non dispo"];
const colors = ["#28a745", "#dc3545"];

const chartCanvas = ref(null);

// Fonction pour naviguer vers la liste des équipements
const navigateToEquipements = () => {
  router.push({
    name: 'Equipements'  // Correction de la casse: 'Equipements' avec E majuscule
  });
};

// Fonction pour mettre à jour le graphique
const updateChart = () => {
  if (chartInstance.value) {
      chartInstance.value.data.datasets[0].data = [available.value, unavailable.value];
      chartInstance.value.update();
  }
};

watch(() => props.selectedBase, () => {
  fetchEquipementDisponibilite();
});

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
          onClick: (event, elements) => {
              // Quand on clique sur la partie du graphique non disponible (index 1)
              if (elements.length > 0 && elements[0].index === 1) {
                  navigateToEquipements();
              }
          },
          plugins: {
              legend: {
                  position: 'bottom',
                  onClick: (e, legendItem) => {
                      // Quand on clique sur la légende des équipements non disponibles (index 1)
                      if (legendItem.index === 1) {
                          navigateToEquipements();
                      }
                  },
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
              tooltip: {
                  callbacks: {
                      label: function(context) {
                          let label = context.label || '';
                          if (label) {
                              label += ': ';
                          }
                          label += context.raw;
                          return label;
                      },
                      footer: function(tooltipItems) {
                          // Ajouter une indication que le clic mène à la liste filtrée
                          if (tooltipItems[0].dataIndex === 1) {
                              return 'Cliquez pour voir la liste';
                          }
                          return '';
                      }
                  }
              }
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