import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { useUserStore } from '@/stores/user' // 假设使用Pinia进行状态管理
import { useTagsViewsStore } from '@/stores/tagsView'
import { useAppStore } from '@/stores/app'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: {
      requiresAuth: false,
      title: '登录',
    },
  },
  {
    path: '/',
    name: 'MainLayout',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true,
    },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/Dashboard.vue'),
        meta: {
          title: '仪表盘',
          icon: 'Odometer',
          affix: true, // 关键：设置为固定标签，不能关闭
          keepAlive: true,
        },
      },
      {
        path: 'system',
        name: 'System',
        redirect: '/system/user',
        meta: { title: '系统管理', icon: 'Setting' },
        children: [
          {
            path: 'user',
            name: 'UserList',
            component: () => import('@/pages/system/UserList.vue'),
            meta: { title: '用户列表', keepAlive: true },
          },
          {
            path: 'user/:id',
            name: 'UserDetail',
            component: () => import('@/pages/system/UserDetail.vue'),
            meta: { title: '用户详情' },
            props: true, // 可以将路由参数 :id 作为 props 传递给组件[3,5](@ref)
          },
          {
            path: 'profile',
            name: 'Profile',
            component: () => import('@/pages/system/Profile.vue'),
            meta: { title: '个人资料', keepAlive: true },
          },
        ],
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
    meta: { title: '页面未找到' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const appStore = useAppStore()
  const tagsViewStore = useTagsViewsStore()
  // 设置页面标题
  document.title = `${to.meta.title || 'Vue Admin'}`
  if (to.meta?.noTagsView !== true) {
    tagsViewStore.addView(to)
  }
  // ✅ 在离开页面时检查是否需要清除刷新标记
  if (from.fullPath) {
    const refreshFlag = tagsViewStore.getRefreshFlag(from.fullPath)
    if (refreshFlag > 0) {
      console.log(`离开页面 ${from.fullPath}，清除刷新标记`)
      tagsViewStore.clearRefreshFlag(from.fullPath)
    }
  }
  // 检查路由是否需要认证
  if (to.meta.requiresAuth && !userStore.token) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export const refreshCurrentRoute = async () => {
  const appStore = useAppStore()
  const currentPage = router.currentRoute.value.path

  await appStore.reloadPage(currentPage)
}

export default router
