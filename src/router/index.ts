import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from './guards';

import PublicLayout from '@/components/layouts/PublicLayout.vue';
import PrivateLayout from '@/components/layouts/PrivateLayout.vue';

// Lazy loading para vistas públicas
const LoginView = () => import(/* webpackChunkName: "auth" */ '@/views/LoginView.vue');
const RegisterView = () => import(/* webpackChunkName: "auth" */ '@/views/RegisterView.vue');

// Lazy loading para vistas privadas con chunks específicos por dominio
const DashboardView = () => import(/* webpackChunkName: "dashboard" */ '@/views/DashboardView.vue');
const RealEstateView = () =>
  import(/* webpackChunkName: "real-estate" */ '@/views/RealEstateView.vue');
const RentalsView = () => import(/* webpackChunkName: "rental" */ '@/views/RentalsView.vue');
const MortgagesView = () => import(/* webpackChunkName: "mortgage" */ '@/views/MortgagesView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // PUBLIC ROUTES
    {
      path: '/',
      component: PublicLayout,
      children: [
        { path: 'login', name: 'Login', component: LoginView },
        { path: 'register', name: 'Register', component: RegisterView },
        { path: '', redirect: '/login' },
      ],
    },

    // PRIVATE ROUTES
    {
      path: '/app',
      component: PrivateLayout,
      beforeEnter: authGuard,
      children: [
        { path: 'dashboard', name: 'Dashboard', component: DashboardView },
        { path: 'real-estate', name: 'RealEstate', component: RealEstateView },
        { path: 'rentals', name: 'Rentals', component: RentalsView },
        { path: 'mortgages', name: 'Mortgages', component: MortgagesView },
        { path: '', redirect: '/app/dashboard' },
      ],
    },

    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
});

// Guard global para evitar que usuarios autenticados accedan a login/register
import { useAuthStore } from '@/stores/auth.store';
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();
  // Si está autenticado y va a login o register, redirige al dashboard
  if (auth.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
    return next('/app/dashboard');
  }
  next();
});

export default router;
