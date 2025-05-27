import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/Equipements',
      name: 'Equipements',
      component: () => import('../views/Equipements.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tickets',
      name: 'Tickets',
      component: () => import('../views/Tickets.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/actions',
      name: 'Actions',
      component: () => import('../views/Actions.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/account',
      name: 'Account',
      component: () => import('../views/Account.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/AlertsList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/logout',
      name: 'Logout',
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore();
        authStore.logout();
        next('/login');
      }
    },
    {
      path: '/notifications',
      redirect: '/actions'
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard'
    }
  ]
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  console.log('Navigation guard triggered:', {
    to: to.path,
    from: from.path
  });

  const authStore = useAuthStore();
  
  // Si c'est la première navigation ou un rafraîchissement
  if (!from.name) {
    console.log('Premier chargement ou rafraîchissement, vérification de la session');
    const restored = await authStore.initializeAuth();
    
    // Si la session est restaurée avec succès
    if (restored) {
      console.log('Session restaurée avec succès');
      // Si on essaie d'aller sur login alors qu'on est authentifié
      if (to.path === '/login') {
        next('/dashboard');
        return;
      }
      // Sinon continuer vers la destination demandée
      next();
      return;
    } 
    // Si pas de session valide et route protégée
    else if (to.meta.requiresAuth) {
      console.log('Pas de session valide, redirection vers login');
      next('/login');
      return;
    }
  }

  // Pour toute autre navigation
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Route protégée, redirection vers login');
    next('/login');
    return;
  }

  // Si déjà authentifié et essaie d'aller sur login
  if (to.path === '/login' && authStore.isAuthenticated) {
    console.log('Déjà authentifié, redirection vers dashboard');
    next('/dashboard');
    return;
  }

  // Dans tous les autres cas, permettre la navigation
  next();
});

export default router;