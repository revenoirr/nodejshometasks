import { createRouter, createWebHistory } from 'vue-router';
import authService from '../services/authService';

import AuthLayout from '../layouts/AuthLayout.vue';

import LoginView from '../views/Login.vue';
import RegisterView from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';

const routes = [
  {
    path: '/login',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: LoginView,
        meta: { 
          requiresAuth: false,
          hideForAuth: true
        }
      }
    ]
  },
  {
    path: '/register',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'Register',
        component: RegisterView,
        meta: { 
          requiresAuth: false,
          hideForAuth: true
        }
      }
    ]
  },
  
  {
    path: '/',
    name: 'Home',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const hideForAuth = to.matched.some(record => record.meta.hideForAuth);

  console.log('🔍 Router guard check:', {
    goingTo: to.path,
    isAuthenticated,
    requiresAuth,
    hideForAuth
  });

  if (requiresAuth && !isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to /login');
    next('/login');
  }
  else if (hideForAuth && isAuthenticated) {
    console.log('✅ Already authenticated, redirecting to /');
    next('/');
  }
  else {
    console.log('✅ Access granted');
    next();
  }
});

export default router;