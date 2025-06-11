// frontend/src/router.ts

import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Main from './components/Main.vue'
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import Reservations from './components/Reservations.vue';
import Offer from './components/Offer.vue';
import UserReservations from './components/UserReservations.vue';
import Admin from './components/Admin.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', component: Main },
  { path: '/log_in', component: Login },
  { path: '/register', component: Register },
  { path: '/reservations', component: Reservations },
  { path: '/user/reservations', component: UserReservations },
  { path: '/offer/:id', component: Offer },
  { path: '/admin', component: Admin }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
