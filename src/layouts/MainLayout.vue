<!--
  主布局组件 MainLayout
  - 负责页面整体布局：侧边栏、头部、标签页与主内容区
  - 通过 provide 将布局状态和全局刷新方法注入给子组件
-->
<template>
  <div class="main-layout">
    <el-container
      class="layout-container"
      :direction="sidebarMode === 'horizontal' ? 'vertical' : 'horizontal'"
    >
      <!-- 侧边栏 -->
      <app-sidebar
        :collapse="sidebarMode === 'vertical' ? isSidebarCollapsed : false"
        :mode="sidebarMode"
        @toggle-collapse="toggleSidebar"
      />
      <el-container style="flex-direction: column" direction="vertical">
        <!-- 头部 -->
        <app-header :sidebar-collapsed="isSidebarCollapsed" @toggle-sidebar="toggleSidebar" />
        <!-- 标签页 -->
        <tags-view v-if="appStore.settings.showTagsView" />
        <!-- 主内容区 -->
        <app-main />
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
// 主布局逻辑：控制侧边栏折叠与提供全局刷新/状态给子组件
import { ref, provide, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'

import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'
import AppMain from './components/AppMain.vue'
import TagsView from './components/TagsView.vue'

const appStore = useAppStore()
const permissionStore = usePermissionStore()

const { sidebarCollapsed: isSidebarCollapsed } = storeToRefs(appStore)

// 侧边栏模式（大屏垂直，小屏水平）
const sidebarMode = computed(() => (appStore.isSmallScreen ? 'horizontal' : 'vertical'))

// 使用 store 中的响应式断点
// 监听小屏幕变化，自动折叠侧边栏
watch(
  () => appStore.isSmallScreen,
  newVal => {
    if (newVal) {
      appStore.sidebarCollapsed = true
    }
  },
  { immediate: true }
)

// 切换侧边栏折叠状态的回调，由头部或侧边栏触发
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

// 全局刷新方法：派发全局事件，子组件可监听并执行自己的刷新逻辑
const handleGlobalRefresh = () => {
  const event = new CustomEvent('global-refresh')
  window.dispatchEvent(event)
}

// 将布局相关状态与方法注入到子组件中，避免通过 props 层层传递
provide('layoutState', {
  isSidebarCollapsed,
  toggleSidebar,
})

// 提供一个全局刷新接口，子组件可以通过 inject('globalRefresh') 使用
provide('globalRefresh', handleGlobalRefresh)
</script>

<style scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;
}
</style>
