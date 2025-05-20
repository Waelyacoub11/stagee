<template>
  <main class="app">
    <Sidebar v-if="showSidebar" />
    <div :class="{ 'content': showSidebar, 'full-content': !showSidebar }">
      <router-view />
    </div>
  </main>
</template>



<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useAuthStore } from './stores/authStore'
  import Sidebar from './components/Sidebar.vue';

  const route = useRoute()
  const authStore = useAuthStore()
  
  const showSidebar = computed(() => {
    return authStore.isAuthenticated && route.name !== 'Login'
  })
</script>


<style lang="scss">
:root{
  --primary: #d36c0b;
  --grey: #64748b;
  --dark: #1e293b;
  --dark-alt: #334155;
  --light: #f1f5f9;
  --sidebar-width: 300px;
  --sidebar-width-collapsed: calc(2rem + 32px);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Fira sans', sans-serif;
}

body {
  background: var(--light);
}

button {
  cursor: pointer;
  appearance: none;
  border: none;
  outline: none;
  background: none;
}

.app {
  position: relative;

  .content {
    min-height: 100vh;
    width: 100%;
    padding: 2rem;
  }

  .full-content {
    min-height: 100vh;
    width: 100%;
    padding: 0;
  }
}

</style>
