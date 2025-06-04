// frontend/src/router.ts

import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Main from './components/Main.vue'
import Login from './components/Login.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', component: Main },
  { path: '/log_in', component: Login }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
