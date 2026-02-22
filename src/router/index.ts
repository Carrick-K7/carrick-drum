import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    redirect: '/teaching'
  },
  {
    path: '/teaching',
    name: 'teaching',
    component: () => import('../views/TeachingView.vue')
  },
  {
    path: '/practice',
    name: 'practice',
    component: () => import('../views/PracticeView.vue')
  },
  {
    path: '/free',
    name: 'free',
    component: () => import('../views/FreePlayView.vue')
  },
  {
    path: '/scores',
    name: 'scores',
    component: () => import('../views/ScoresView.vue')
  },
  {
    path: '/todo',
    name: 'todo',
    component: () => import('../views/TodoView.vue')
  },
  {
    path: '/import',
    name: 'import',
    component: () => import('../views/MP3ImportView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/teaching'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
