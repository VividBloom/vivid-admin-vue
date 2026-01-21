/**
 * 应用级状态管理（App Store）
 * - 管理页面刷新标志、缓存视图、窗口尺寸、主题（暗黑/亮色）等全局状态
 */
import { defineStore } from 'pinia'
import {
  useDark,
  useToggle,
  useBreakpoints,
  breakpointsTailwind,
  useWindowSize,
} from '@vueuse/core'
import { ref, computed } from 'vue'
import i18n from '@/i18n'

export const useAppStore = defineStore(
  'app',
  () => {
    // 是否触发重新渲染/刷新（配合组件内部的 v-if 或 key 切换实现刷新）
    const reloadFlag = ref(true)
    // 缓存的视图组件名称（用于 keep-alive 的 include）
    const cachedViews = ref<string[]>([])
    // 指定需要刷新的路由路径（reloadPage 会设置该字段）
    const needReloadPath = ref<string | null>('')

    // 使用 VueUse 的 useBreakpoints 管理响应式断点
    const breakpoints = useBreakpoints(breakpointsTailwind)

    // 恢复 windowSize 以保持兼容性
    const { width, height } = useWindowSize()
    const windowSize = computed(() => ({ width: width.value, height: height.value }))

    // 当前断点 (保持原有逻辑)
    const currentBreakpoint = computed(() => {
      if (breakpoints.greaterOrEqual('xl').value) return 'xl'
      if (breakpoints.greaterOrEqual('lg').value) return 'lg'
      if (breakpoints.greaterOrEqual('md').value) return 'md'
      if (breakpoints.greaterOrEqual('sm').value) return 'sm'
      return 'xs'
    })

    // 是否为小屏幕（< md: 768px）
    const isSmallScreen = breakpoints.smaller('md')
    // 是否为中等屏幕（< lg: 1024px）
    const isMediumScreen = breakpoints.smaller('lg')
    // 是否为大屏幕（>= lg: 1024px）
    const isLargeScreen = breakpoints.greaterOrEqual('lg')

    const initialized = ref(false)
    // 使用 useDark 创建响应式暗黑模式状态
    const isDark = useDark({
      valueDark: 'dark', // 暗黑模式应用的 CSS 类名
      valueLight: 'light', // 亮色模式应用的 CSS 类名
      initialValue: 'light', // 初始值：'light' | 'dark' | 'auto'
    })

    // 侧边栏折叠状态
    const sidebarCollapsed = ref(false)
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    // 语言设置
    const language = ref('zh-cn')
    const setLanguage = (lang: string) => {
      language.value = lang
      if (i18n.global.locale.value !== lang) {
        i18n.global.locale.value = lang
      }
    }

    // 布局设置
    const settings = ref({
      showTagsView: true,
      showLogo: true,
      fixedHeader: true,
      showBreadcrumb: true,
    })

    const menuRoutes = ref([
      {
        path: '/dashboard',
        meta: { title: 'route.dashboard', icon: 'Odometer', keepAlive: true },
      },
      {
        path: '/system',
        meta: { title: 'route.system', icon: 'Setting' },
        children: [
          { path: '/system/user', meta: { title: 'route.userList', keepAlive: true } },
          { path: '/system/role', meta: { title: 'route.roleManagement', keepAlive: true } },
        ],
      },
    ])

    const initializeApp = async () => {
      initialized.value = true
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
      sidebarCollapsed,
      language,
      settings,

      // getters
      themeName,
      currentBreakpoint,
      isSmallScreen,
      isMediumScreen,
      isLargeScreen,

      // action
      initializeApp,
      addCachedView,
      deleteCachedView,
      setReloadFlag,
      reloadPage,
      toggleDark,
      toggleSidebar,
      setLanguage,
    }
  },
  {
    persist: {
      paths: ['isDark', 'sidebarCollapsed', 'language', 'settings'],
      storage: localStorage,
    },
  }
)
