<template>
  <div class="dropdown" ref="dropdownRef">
    <button class="dropdown-button" @click.stop="toggleMenu">…</button>
    <div v-if="isOpen" class="dropdown-menu" :class="{ 'dropdown-menu--top': isMenuAbove}">
      <button @click="handleEdit">
        <span class="material-icons">edit</span>
        Edit
      </button>

      <button class = "delete-button" @click="handleDelete">
        <span class="material-icons">delete</span>
        Delete
      </button>  
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isOpen = ref(false);
const isMenuAbove = ref(false);
const dropdownRef = ref(null);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const handleEdit = () => {
  isOpen.value = false;
  // Emit an event to handle edit
};

const handleDelete = () => {
  isOpen.value = false;
  // Emit an event to handle delete
};

// Handle clicks outside the dropdown
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped lang="scss">
.dropdown {
  position: relative;
  display: inline-block;

  .dropdown-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.25rem;
  }

  &:hover {
    background-color: #f6f2f2;
  }

  button {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    gap: 0.5rem;
    cursor: pointer;
    background: none;
    border: none;
    text-align: left;
    width: 100%;

    &:hover {
      background: #f1f1f1;
    }

    .material-icons {
      font-size: 1.25rem;
    }
  }

  .delete-button {
    color: red;

    &:hover {
      background: #cc0000;
    }

    .material-icons {
      color: inherit;
    }
  }

  .dots {
    font-size: 1.5rem;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 1000;

    &.dropdown-menu--top {
      top: auto;
      bottom: 100%; /* Position above the button */
    }

    button {
      display: flex;
      width: 6rem;
      height: 2rem;
      padding: 0.5rem 1rem;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;

      &:hover {
        background: #f1f1f1;
      }
    }
  }
}
</style>