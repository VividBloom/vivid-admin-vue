/**
 * 路由配置文件
 * - 定义应用的路由表与路由守卫
 * - 这里包含了权限校验、动态标签页（TagsView）记录以及页面标题管理
 */
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { useUserStore } from '@/stores/user' // 使用 Pinia 管理用户认证信息
import { useTagsViewsStore } from '@/stores/tagsView' // 管理标签页（TagsView）的状态
import { useAppStore } from '@/stores/app' // 应用状态（例如页面重载）
import { usePermissionStore } from '@/stores/permission'
import i18n from '@/i18n'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: {
      requiresAuth: false,
      title: 'route.login',
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
          title: 'route.dashboard',
          icon: 'Odometer',
          affix: true, // 关键：设置为固定标签，不能关闭
          keepAlive: true,
        },
      },
      {
        path: 'system',
        name: 'System',
        redirect: '/system/user',
        meta: { title: 'route.system', icon: 'Setting' },
        children: [
          {
            path: 'user',
            name: 'UserList',
            component: () => import('@/pages/system/UserList.vue'),
            meta: { title: 'route.userList', keepAlive: true },
          },
          {
            path: 'user/:id',
            name: 'UserDetail',
            component: () => import('@/pages/system/UserDetail.vue'),
            meta: { title: 'route.userDetail', parent: 'UserList' },
            props: true, // 可以将路由参数 :id 作为 props 传递给组件
          },
          {
            path: 'role',
            name: 'RoleManagement',
            component: () => import('@/pages/system/RoleManagement.vue'),
            meta: { title: 'route.roleManagement', keepAlive: true },
          },
          {
            path: 'permission',
            name: 'PermissionManagement',
            component: () => import('@/pages/system/PermissionManagement.vue'),
            meta: { title: 'route.permissionManagement', keepAlive: true },
          },
          {
            path: 'log',
            name: 'AuditLog',
            component: () => import('@/pages/system/AuditLog.vue'),
            meta: { title: 'route.auditLog', keepAlive: true },
          },
          {
            path: 'dict',
            name: 'DictionaryManagement',
            component: () => import('@/pages/system/DictionaryManagement.vue'),
            meta: { title: 'route.dict', keepAlive: true },
          },
          {
            path: 'department',
            name: 'DepartmentManagement',
            component: () => import('@/pages/system/DepartmentManagement.vue'),
            meta: { title: 'route.department', keepAlive: true },
          },
          {
            path: 'profile',
            name: 'Profile',
            component: () => import('@/pages/system/Profile.vue'),
            meta: { title: 'route.profile', keepAlive: true },
          },
          {
            path: 'password',
            name: 'ChangePassword',
            component: () => import('@/pages/system/ChangePassword.vue'),
            meta: { title: 'route.changePassword' },
          },
        ],
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
    meta: { title: 'route.notFound' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const tagsViewStore = useTagsViewsStore()
  const permissionStore = usePermissionStore()
  // 设置页面标题
  // 根据路由元信息动态设置页面 title，便于用户和浏览器历史记录识别
  const titleKey = to.meta.title || 'app.title'
  document.title = i18n.global.t(titleKey as string)

  if (to.meta?.noTagsView !== true) {
    tagsViewStore.addView(to)
  }
  // ✅ 在离开页面时检查是否需要清除刷新标记
  if (from.fullPath) {
    const refreshFlag = tagsViewStore.getRefreshFlag(from.fullPath)
    if (refreshFlag > 0) {
      tagsViewStore.clearRefreshFlag(from.fullPath)
    }
  }
  // 检查路由是否需要认证
  // 如果目标路由需要认证且当前没有 token，则跳转到登录页
  if (to.meta.requiresAuth && !userStore.token) {
    next({ name: 'Login' })
  } else if (userStore.token && permissionStore.userMenus.length === 0) {
    // 检查是否已加载权限信息（防止刷新丢失）
    try {
      // 并发获取用户信息和权限
      const promises = [permissionStore.initPermissions()]
      if (!userStore.userInfo) {
        promises.push(userStore.fetchUserInfo())
      }
      await Promise.all(promises)
      next({ ...to, replace: true })
    } catch (error) {
      console.error('Failed to load permissions:', error)
      userStore.logout()
      next({ name: 'Login' })
    }
  } else {
    next()
  }
})

export const refreshCurrentRoute = async () => {
  const appStore = useAppStore()
  const currentPage = router.currentRoute.value.path

  // 触发应用层的页面重载（例如刷新组件或重新拉取数据）
  await appStore.reloadPage(currentPage)
}

export default router
