<!-- src/views/Home.vue -->
<template>
  <div class="home-page">
    <h1></h1>
    <p></p>
    <!-- Utilisation du composant HomeAlert -->
    <HomeAlert />
  </div>
</template>

<script setup>

import HomeAlert from "../components/Home/HomeAlert.vue"; // ajuste le chemin si besoin
</script>

<style lang="scss" scoped>
.home-page {
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
