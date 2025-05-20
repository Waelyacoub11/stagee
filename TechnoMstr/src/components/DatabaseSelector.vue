<template>
  <div v-if="authStore.availableDatabases.length > 0" class="database-selector">
    <label for="database-select">Sélectionner une entreprise :</label>
    <select 
      id="database-select" 
      v-model="selectedDatabase"
      class="form-select"
      @change="handleDatabaseChange"
    >
      <option 
        v-for="db in authStore.availableDatabases" 
        :key="db" 
        :value="db"
      >
        {{ db === 'techno1' ? 'Techno 1' : 'Techno 2' }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const selectedDatabase = computed({
  get: () => authStore.selectedDatabase,
  set: (value) => authStore.setSelectedDatabase(value)
})

const handleDatabaseChange = () => {
  // Vous pouvez ajouter ici une logique supplémentaire si nécessaire
  // Par exemple, recharger les données de la page
}
</script>

<style scoped>
.database-selector {
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.form-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}

label {
  font-weight: 500;
}
</style> 