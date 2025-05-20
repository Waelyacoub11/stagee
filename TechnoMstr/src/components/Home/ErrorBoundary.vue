<!-- src/components/ErrorBoundary.vue -->
<template>
    <slot v-if="!error" />
    <slot v-else name="fallback" :error="error" :resetError="resetError" />
  </template>
  
  <script setup>
  import { ref, onErrorCaptured, provide } from 'vue';
  
  const props = defineProps({
    onError: {
      type: Function,
      default: null
    }
  });
  
  const error = ref(null);
  
  const resetError = () => {
    error.value = null;
  };
  
  // Fournir la fonction de réinitialisation aux composants enfants
  provide('resetError', resetError);
  
  onErrorCaptured((err, instance, info) => {
    console.error('Erreur capturée dans ErrorBoundary:', err);
    console.error('Info:', info);
    console.error('Instance:', instance);
    
    error.value = err;
    
    // Appeler le handler d'erreur personnalisé s'il existe
    if (props.onError) {
      props.onError(err, instance, info);
    }
    
    // Empêcher la propagation de l'erreur
    return false;
  });
  </script>