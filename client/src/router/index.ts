import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import LoginView from '../views/LoginView.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/', name: 'Dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: LoginView },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Make sure we know the current sign-in state (including a restored
  // session) before deciding whether to redirect.
  await auth.initAuthListener()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'Login' && auth.isLoggedIn) {
    return { name: 'Dashboard' }
  }

  return true
});

export default router;