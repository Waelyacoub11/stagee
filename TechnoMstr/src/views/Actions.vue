<template>
  <div class="app-container">
    <main class="main-content">
      <!-- Affichage du tableau des actions -->
      
      <ActionsTable />
    </main>
  </div>
</template>

<script setup>
import ActionsTable from "../components/ActionsComponents/ActionsTable.vue";
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
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
  padding-right: calc(4rem + 60px);
  background-color: #fff;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  margin-left: 0;
  width: 100%;
  box-sizing: border-box;
  transition: padding-left 0.2s ease-out;

  &.sidebar-expanded {
    padding-left: calc(var(--sidebar-width) + 2rem);
  }

  h1 {
    margin-bottom: 1rem;
  }
}
</style>