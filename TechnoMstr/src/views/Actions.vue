<template>
  <div class="notifications-page">
    <h1>Actions</h1>
    <p>Ceci est la page des actions.</p>

    <!-- Utilisation du composant ActionsTable -->
    <ActionsTable />
  </div>
</template>

<script setup>
import ActionsTable from "../components/ActionsComponents/ActionsTable.vue";
</script>

<style lang="scss" scoped>
.notifications-page {
  width: 102%;
  padding: 1rem;
  padding-left: calc(2rem + 48px);
  box-sizing: border-box;
  transition: padding-left 0.2s ease-out;

  &.sidebar-expanded {
    padding-left: calc(var(--sidebar-width) + 1rem);
  }

  h1 {
    margin-bottom: 1rem;
  }
}
</style>