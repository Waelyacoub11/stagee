import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import EquipementsTable from '../EquipementsTable.vue'

// Mock axios
vi.mock('axios', () => ({
  get: vi.fn(() => Promise.resolve({ 
    data: { 
      techno1: [], 
      techno2: [] 
    } 
  }))
}))

describe('EquipementsTable.vue', () => {
  let wrapper
  let authStore

  beforeEach(() => {
    // Créer une nouvelle application et un nouveau store pour chaque test
    const app = createApp({})
    const pinia = createPinia()
    app.use(pinia)
    setActivePinia(pinia)
    
    authStore = useAuthStore()
    
    // Configurer le store d'authentification pour les tests
    authStore.user = { role: 'globaladmin' }
    
    wrapper = mount(EquipementsTable, {
      global: {
        plugins: [pinia],
        stubs: {
          // Ajouter ici les composants enfants si nécessaire
        }
      }
    })
  })

  it('affiche le titre de la page', () => {
    expect(wrapper.find('.page-title').text()).toContain('Équipements')
  })

  it('affiche le sélecteur d\'entreprise', () => {
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('option[disabled]').text()).toContain('Choisir une entreprise')
  })

  it('affiche la barre de recherche', () => {
    expect(wrapper.find('input[type="search"]').exists()).toBe(true)
  })

  it('affiche les options d\'entreprise correctes pour un globaladmin', () => {
    const options = wrapper.findAll('option')
    expect(options).toHaveLength(3) // Option désactivée + Techno 1 + Techno 2
    expect(options[1].text()).toBe('Techno 1')
    expect(options[2].text()).toBe('Techno 2')
  })
})
