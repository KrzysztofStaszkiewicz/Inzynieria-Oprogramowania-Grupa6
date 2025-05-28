// frontend/src/router.ts

import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Main from './components/Main.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', component: Main }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
