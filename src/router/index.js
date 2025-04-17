import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import UserCenter from '@/components/user/UserCenter.vue'
import SearchResult from '@/views/SearchResult.vue'
import MessageCenter from '@/views/MessageCenter.vue'
import { useTokenStore } from '@/stores/token'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/search',
    name: 'SearchResult',
    component: SearchResult
  },
  {
    path: '/user-center',
    name: 'userCenter',
    component: UserCenter,
    meta: { requiresAuth: true }
  },
  {
    path: '/video/:id',
    name: 'VideoDetail',
    component: () => import('@/components/video/VideoDetail.vue')
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/components/ResetPassword.vue')
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/UserChat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user',
    name: 'UserHome',
    component: () => import('@/views/UserHome.vue')
  },
  {
    path: '/announcement/:id',
    name: 'AnnouncementDetail',
    component: () => import('@/views/AnnouncementDetail.vue')
  },
  {
    path: '/messages',
    name: 'MessageCenter',
    component: MessageCenter,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const tokenStore = useTokenStore()
  if (to.meta.requiresAuth && !tokenStore.token) {
    next('/') // 未登录时重定向到首页
  } else {
    next()
  }
})

export default router