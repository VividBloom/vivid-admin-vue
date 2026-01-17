import { defineStore } from 'pinia'
import { useDark, useToggle } from '@vueuse/core'

export const useAppStore = defineStore('app', () => {
  const reloadFlag = ref(true) // 控制组件刷新的标志
  const cachedViews = ref<string[]>([]) // 缓存的视图组件名称
  const needReloadPath = ref<string | null>('') // 需要刷新的路径
  const windowSize = ref<{ width: number; height: number }>({ width: 0, height: 0 })
  const initialized = ref(false)
  // 使用 useDark 创建响应式暗黑模式状态
  const isDark = useDark({
    valueDark: 'dark', // 暗黑模式应用的 CSS 类名
    valueLight: 'light', // 亮色模式应用的 CSS 类名
    initialValue: 'light', // 初始值：'light' | 'dark' | 'auto'
  })
  const menuRoutes = ref([
    {
      path: '/dashboard',
      meta: { title: '仪表盘', icon: 'Odometer', keepAlive: true },
    },
    {
      path: '/system',
      meta: { title: '系统管理', icon: 'Setting' },
      children: [
        { path: '/system/user', meta: { title: '用户管理', keepAlive: true } },
        { path: '/system/role', meta: { title: '角色管理', keepAlive: true } },
      ],
    },
  ])

  const initializeApp = async () => {
    initialized.value = true
  }

  const updateWindowSize = async (size: { width: number; height: number }) => {
    windowSize.value = size
  }

  // 添加缓存视图
  const addCachedView = (view: string) => {
    if (!cachedViews.value.includes(view)) {
      cachedViews.value.push(view)
    }
  }

  // 删除缓存视图
  const deleteCachedView = (view: string) => {
    const index = cachedViews.value.indexOf(view)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }

  // 设置重新加载标志
  const setReloadFlag = (flag: boolean) => {
    reloadFlag.value = flag
  }

  // 刷新指定路径的页面
  const reloadPage = async (path: string) => {
    needReloadPath.value = path
    reloadFlag.value = false
    // 使用微任务确保在下个事件循环中更新
    await Promise.resolve()
    reloadFlag.value = true
    needReloadPath.value = null
  }

  // 切换函数
  const toggleDark = useToggle(isDark)

  // // 获取当前主题名称
  const themeName = computed(() => (isDark.value ? 'dark' : 'light'))

  return {
    // states
    reloadFlag,
    cachedViews,
    needReloadPath,
    windowSize,
    initialized,
    isDark,
    menuRoutes,

    // getters
    themeName,

    // action
    initializeApp,
    updateWindowSize,
    addCachedView,
    deleteCachedView,
    setReloadFlag,
    reloadPage,
    toggleDark,
  }
})
