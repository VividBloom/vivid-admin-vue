<template>
  <!-- Element Plus 全局配置器 -->
  <el-config-provider :locale="locale" :size="size" :button="buttonConfig">
    <!-- 主应用容器 -->
    <div id="app" class="app-container">
      <!-- 路由渲染出口 -->
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
// ========== 基础依赖导入 ==========
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

// Element Plus 中文语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// ========== 类型定义 ==========
interface ButtonConfig {
  autoInsertSpace?: boolean
}

// ========== 响应式数据 ==========
const locale = ref(zhCn) // Element Plus 国际化设置
const size = ref<'default' | 'small' | 'large'>('default') // 组件全局尺寸
const buttonConfig = ref<ButtonConfig>({ autoInsertSpace: true }) // 按钮配置

// ========== Store 初始化 ==========
const appStore = useAppStore()
const userStore = useUserStore()

// ========== 路由实例 ==========
const route = useRoute()

// ========== 计算属性 ==========
/**
 * 动态页面标题，根据路由元信息显示
 */
const pageTitle = computed(() => {
  const title = (route.meta?.title as string) || '后台管理系统'
  return `${title} - Vue3 Admin`
})

// ========== 生命周期钩子 ==========
/**
 * 组件挂载后执行
 */
onMounted(() => {
  initializeApp()
})

// ========== 方法定义 ==========
/**
 * 应用初始化函数
 */
const initializeApp = async (): Promise<void> => {
  try {
    // 1. 设置页面标题
    document.title = pageTitle.value

    // 2. 初始化应用状态
    await appStore.initializeApp()

    // 3. 检查用户登录状态
    await checkAuthStatus()

    // 4. 监听路由变化更新标题
    setupRouteWatcher()

    // 5. 监听窗口变化（响应式布局需要）
    setupWindowListener()

    console.log('🚀 应用初始化完成')
  } catch (error) {
    console.error('❌ 应用初始化失败:', error)
  }
}

/**
 * 检查用户认证状态
 */
const checkAuthStatus = async (): Promise<void> => {
  // 从本地存储获取 token
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  if (token) {
    try {
      // 如果有 token，尝试获取用户信息
      await userStore.fetchUserInfo()
    } catch (error) {
      console.warn('⚠️ 自动登录失败，清除无效token')
      userStore.logout()
    }
  }
}

/**
 * 设置路由监听器
 */
const setupRouteWatcher = (): void => {
  // 路由变化时更新页面标题
  // 注意：在实际项目中，这通常在路由守卫中处理
}

/**
 * 设置窗口变化监听器
 */
const setupWindowListener = (): void => {
  // 用于响应式布局调整
  const handleResize = (): void => {
    appStore.updateWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }

  window.addEventListener('resize', handleResize)

  // 初始调用一次
  handleResize()
}
</script>

<style lang="scss">
/* ========== 全局样式重置 ========== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ========== HTML 和 Body 样式 ========== */
html,
body,
#app {
  width: 100%;
  height: 100%;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ========== 主应用容器样式 ========== */
.app-container {
  width: 100%;
  height: 100%;
  // background-color: #f5f7fa; // 全局背景色

  /* 确保 Element Plus 组件在暗黑模式下正常显示 */
  &.dark {
    background-color: #141414;
    color: #e5eaf3;
  }
}

/* ========== 全局工具类 ========== */
.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.mt-10 {
  margin-top: 10px;
}

.mt-20 {
  margin-top: 20px;
}

.mb-10 {
  margin-bottom: 10px;
}

.mb-20 {
  margin-bottom: 20px;
}

.p-10 {
  padding: 10px;
}

.p-20 {
  padding: 20px;
}

/* ========== 滚动条样式优化 ========== */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* ========== 响应式设计 ========== */
@media (max-width: 768px) {
  .app-container {
    font-size: 14px; // 移动端调整字体大小
  }
}

/* ========== 动画相关 ========== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========== 打印样式优化 ========== */
@media print {
  .no-print {
    display: none !important;
  }

  .app-container {
    background: white !important;
    color: black !important;
  }
}
</style>
