import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Configuration globale d'axios
axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.defaults.headers.common['Accept'] = 'application/json'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)
  const token = ref(null)

  // Utiliser sessionStorage au lieu de localStorage pour que la session expire à la fermeture du navigateur
  const initializeAuth = async () => {
    console.log('Initialisation de l\'état d\'authentification...')
    
    // Récupérer le token du sessionStorage
    const storedToken = sessionStorage.getItem('token')
    const storedUser = sessionStorage.getItem('user')
    
    if (!storedToken || !storedUser) {
      console.log('Aucune session stockée trouvée')
      isAuthenticated.value = false
      user.value = null
      token.value = null
      return false
    }

    try {
      // Configurer axios avec le token stocké
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      
      // Vérifier si le token est toujours valide
      const response = await axios.get('http://localhost:3000/api/auth/me')
      
      if (response.data) {
        // Restaurer la session
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        isAuthenticated.value = true
        console.log('Session restaurée avec succès')
        return true
      } else {
        throw new Error('Token invalide')
      }
    } catch (error) {
      console.error('Erreur lors de la restauration de la session:', error)
      // Nettoyer en cas d'erreur
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      isAuthenticated.value = false
      user.value = null
      token.value = null
      delete axios.defaults.headers.common['Authorization']
      return false
    }
  }

  const login = async (credentials) => {
    try {
      console.log('Tentative de connexion...')
      
      const response = await axios.post('http://localhost:3000/api/auth/login', credentials)
      console.log('Réponse du serveur:', response.data)
      
      if (response.data && response.data.token && response.data.user) {
        console.log('Connexion réussie, mise à jour de l\'état...')
        
        // Update state
        token.value = response.data.token
        user.value = response.data.user
        isAuthenticated.value = true
        
        // Update sessionStorage instead of localStorage
        sessionStorage.setItem('token', response.data.token)
        sessionStorage.setItem('user', JSON.stringify(response.data.user))
        
        // Update axios defaults
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        
        return true
      }
      
      return false
      
    } catch (error) {
      console.error('Erreur de connexion:', error)
      return false
    }
  }

  const logout = () => {
    console.log('Déconnexion...')
    // Clear state
    token.value = null
    user.value = null
    isAuthenticated.value = false
    
    // Clear storage
    sessionStorage.clear()
    localStorage.clear()
    
    // Clear axios defaults
    delete axios.defaults.headers.common['Authorization']
  }

  const checkAuth = async () => {
    if (!token.value) {
      console.log('Aucun token trouvé')
      return false
    }
    
    try {
      const response = await axios.get('http://localhost:3000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      
      if (response.data) {
        user.value = response.data
        isAuthenticated.value = true
        
        console.log('Vérification d\'authentification réussie:', {
          isAuthenticated: isAuthenticated.value,
          user: user.value
        })
        return true
      } else {
        console.log('Échec de la vérification: aucune donnée utilisateur')
        logout()
        return false
      }
    } catch (error) {
      console.error('Échec de la vérification d\'authentification:', error)
      logout()
      return false
    }
  }

  return { 
    isAuthenticated, 
    user, 
    token,
    login, 
    logout, 
    checkAuth,
    initializeAuth
  }
}) 