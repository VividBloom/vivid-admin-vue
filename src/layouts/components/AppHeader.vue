<!--
  应用头部组件 AppHeader
  - 包含侧边栏折叠按钮、面包屑、主题切换、刷新、全屏、消息与用户菜单
  - 负责触发全局刷新、路由跳转与用户相关交互
-->
<template>
  <el-header class="header-container">
    <div class="header-left">
      <!-- 侧边栏折叠按钮 (仅在大屏显示) -->
      <div v-if="!isSmallScreen" class="collapse-btn" @click="$emit('toggle-sidebar')">
        <el-icon size="20">
          <div :class="sidebarCollapsed ? 'i-ep-expand' : 'i-ep-fold'" />
        </el-icon>
      </div>
      <!-- 面包屑导航 -->
      <el-breadcrumb
        v-if="appStore.settings.showBreadcrumb"
        class="breadcrumb hidden md:block"
        separator="/"
      >
        <el-breadcrumb-item :to="{ path: '/' }">{{ $t('route.dashboard') }}</el-breadcrumb-item>
        <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
          {{ $t(String(item.meta?.title || '')) }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <!-- 暗黑模式切换按钮 -->
      <div class="theme-switch">
        <el-tooltip
          :content="isDark ? $t('app.switchToLight') : $t('app.switchToDark')"
          placement="bottom"
        >
          <el-button circle :class="{ 'dark-active': isDark }" @click="toggleTheme">
            <el-icon v-if="isDark" class="moon-icon">
              <div class="i-ep-moon" />
            </el-icon>
            <el-icon v-else class="sun-icon">
              <div class="i-ep-sunny" />
            </el-icon>
          </el-button>
        </el-tooltip>
      </div>
      <!-- 刷新按钮 -->
      <el-tooltip :content="$t('app.refreshPage')" placement="bottom">
        <div
          class="header-action"
          :title="$t('app.refreshPage')"
          :class="{ refreshing: isRefreshing }"
          @click="handleRefresh"
        >
          <el-icon>
            <div class="i-ep-refresh" />
          </el-icon>
        </div>
      </el-tooltip>
      <!-- 全屏切换 -->
      <div class="header-action" @click="toggleFullScreen">
        <el-tooltip
          effect="dark"
          :content="isFullscreen ? $t('app.exitFullScreen') : $t('app.fullScreen')"
        >
          <el-icon>
            <div :class="isFullscreen ? 'i-ep-copy-document' : 'i-ep-full-screen'" />
          </el-icon>
        </el-tooltip>
      </div>

      <!-- 消息通知 -->
      <Notice />
      <!-- 用户信息 -->
      <el-dropdown trigger="click">
        <span class="user-info">
          <el-avatar :size="32" :src="userStore.userInfo?.avatar"></el-avatar>
          <span class="user-name md:block hidden">{{ userStore.userName }}</span>
          <el-icon><div class="i-ep-arrow-down" /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="toProfile">
              <el-icon><div class="i-ep-user" /></el-icon> {{ $t('app.profile') }}
            </el-dropdown-item>
            <el-dropdown-item @click="toChangePassword">
              <el-icon><div class="i-ep-lock" /></el-icon> {{ $t('route.changePassword') }}
            </el-dropdown-item>
            <el-dropdown-item @click="openSettings">
              <el-icon><div class="i-ep-setting" /></el-icon> {{ $t('app.settings') }}
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><div class="i-ep-switch-button" /></el-icon> {{ $t('app.logout') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>

  <!-- 系统设置 Drawer -->
  <SettingsDrawer v-model="settingsDrawerVisible" />
</template>

<script setup lang="ts">
// 头部组件逻辑与交互说明
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTagsViewsStore } from '@/stores/tagsView'
import { useAppStore } from '@/stores/app'
import SettingsDrawer from './SettingsDrawer.vue'
import Notice from './Notice.vue'
import { useI18n } from 'vue-i18n'

interface Props {
  sidebarCollapsed: boolean
}

defineProps<Props>()
defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const tagsViewStore = useTagsViewsStore()

// 从 appStore 获取主题相关状态与切换方法
const appStore = useAppStore()
const { t } = useI18n()
const { isDark, toggleDark, isSmallScreen } = appStore

// 系统设置 Drawer 状态
const settingsDrawerVisible = ref(false)

// 全屏状态
const isFullscreen = ref(false)

// 面包屑：路由中带有 meta.title 的项
const breadcrumbList = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  const result = matched.slice(1) // 去掉首页，返回从一级菜单开始的面包屑

  // 处理父级路由（用于详情页显示上级列表）
  if (route.meta?.parent) {
    const parentName = route.meta.parent as string
    try {
      const parentRoute = router.resolve({ name: parentName })
      if (parentRoute) {
        const parentItem = {
          path: parentRoute.path,
          meta: parentRoute.meta,
        }
        // 插入到当前页面之前
        if (result.length > 0) {
          result.splice(result.length - 1, 0, parentItem as any)
        } else {
          result.unshift(parentItem as any)
        }
      }
    } catch (e) {
      console.warn('解析父级路由失败:', parentName)
    }
  }

  return result
})

// 切换主题（暗/亮）
const toggleTheme = () => {
  toggleDark()
}

// 刷新相关状态
const isRefreshing = ref(false)
const isMobile = ref(false)

// 检测是否为移动端（简单宽度判断）
const checkIsMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// 刷新当前页面：优先使用注入或全局方法，否则通过路由带时间戳强制刷新
const handleRefresh = async () => {
  if (isRefreshing.value) return
  try {
    isRefreshing.value = true
    const currentPage = route.fullPath
    if (!currentPage) {
      ElMessage.warning(t('app.cannotGetPageInfo'))
      return
    }

    // 使用 tagsViewStore 标记当前页面需要刷新（组件内会通过 refreshFlag 使用该标记）
    tagsViewStore.markViewForRefresh(currentPage)

    ElMessage.info({ message: t('app.refreshing'), duration: 1000 })

    // 优先尝试页面内注入的刷新方法，否则通过路由替换来刷新
    if (typeof (window as any).reloadCurrentPage === 'function') {
      await (window as any).reloadCurrentPage()
    } else {
      await router.replace({ path: currentPage, query: { _t: Date.now() } })
    }

    setTimeout(() => ElMessage.success(t('app.refreshSuccess')), 600)
  } catch (e) {
    console.error('刷新失败: ', e)
    ElMessage.error(t('app.refreshFailed'))
  } finally {
    // 延迟清除刷新状态并清理刷新标记，保留短暂的视觉反馈
    setTimeout(() => {
      isRefreshing.value = false
      const currentPath = route.fullPath
      if (currentPath) {
        setTimeout(() => tagsViewStore.clearRefreshFlag(currentPath), 2000)
      }
    }, 1000)
  }
}

// 键盘刷新拦截（例如 F5 或 Ctrl+R）
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
    event.preventDefault()
    handleRefresh()
  }
}

// 打开系统设置 Drawer
const openSettings = () => {
  settingsDrawerVisible.value = true
}

onMounted(() => {
  // 添加键盘与窗口尺寸监听
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', checkIsMobile)
  checkIsMobile()
})

onUnmounted(() => {
  // 组件卸载时清理事件监听
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', checkIsMobile)
})

// 切换全屏
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
    return
  }
  if (document.exitFullscreen) {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 页面跳转与用户菜单操作
const toProfile = () => router.push('/system/profile')
const toChangePassword = () => router.push('/system/password')

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(t('app.confirmLogout'), t('app.confirm'), {
      confirmButtonText: t('app.ok'),
      cancelButtonText: t('app.cancel'),
      type: 'warning',
    })

    await userStore.logout()
    ElMessage.success(t('app.logoutSuccess'))
    router.push('/login')
  } catch (error) {
    console.warn(t('app.logoutCancelled'))
  }
}
</script>

<style scoped>
.refresh-icon {
  transition: transform 0.3s;
}

.refresh-icon.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.header-action.refreshing {
  color: #409eff;
  cursor: not-allowed;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .header-action span {
    display: none;
  }
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  /* background-color: #fff; */
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  margin-right: 20px;
  cursor: pointer;
  color: #666;
}

.collapse-btn:hover {
  color: #409eff;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-action {
  cursor: pointer;
  color: #666;
  padding: 8px;
}

.header-action:hover {
  color: #409eff;
  /* background-color: #f5f7fa; */
  border-radius: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.user-name {
  margin: 0 8px;
  font-size: 14px;
}

.theme-switch {
  display: flex;
  align-items: center;
}

.theme-switch-compact {
  --el-switch-on-color: #409eff;
  --el-switch-off-color: #dcdfe6;
}

/* 暗黑模式下的按钮样式 */
:deep(.dark-active) {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #409eff;
}

.moon-icon {
  color: #f0c040;
}

.sun-icon {
  color: #f39c12;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-switch-compact {
    :deep(.el-switch__inner) {
      display: none;
    }
  }
}

/* 系统设置样式 */
.settings-content {
  padding: 20px;
}

.setting-item {
  margin-bottom: 30px;

  h4 {
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: 500;
  }

  .el-radio-group,
  .el-select {
    width: 100%;
  }
}
</style>
