<template>
  <div class="app-container">
    <main class="main-content">
      <!-- Affichage du tableau des tickets sans la prop 'searchQuery' -->
      <TicketTable />
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import TicketTable from "../components/TicketComponents/TicketTable.vue";

const searchQuery = ref('');

// Cette fonction est conservée si vous voulez gérer la recherche à l'avenir
const handleSearch = (query) => {
  searchQuery.value = query;
};
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  width: 100%; /* Occupation complète de la largeur sans sidebar */
  background-color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0;
  margin: 0;
}

.main-content {
  flex: 1;
  padding: 1rem;
  padding-left: calc(8rem + 60px);
  padding-right: calc(4rem + 60px); /* Ajustement du padding pour simuler l'espace sans sidebar */
  background-color: #fff;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  margin-left: 0; /* Retirer la marge de la sidebar */
  width: 100%; /* Occupation complète de la largeur */
  box-sizing: border-box;
  transition: padding-left 0.2s ease-out;

  &.sidebar-expanded {
    padding-left: calc(var(--sidebar-width) + 2rem); /* Gestion de l'extension de la sidebar si besoin */
  }

  h1 {
    margin-bottom: 1rem;
  }
}
</style>
