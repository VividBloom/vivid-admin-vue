<template>
  <div class="main-layout">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <app-sidebar :collapse="isSidebarCollapsed" @toggle-collapse="toggleSidebar" />
      <!-- 右侧主区域 -->
      <el-container style="flex-direction: column" direction="vertical">
        <!-- 头部 -->
        <app-header :sidebar-collapsed="isSidebarCollapsed" @toggle-sidebar="toggleSidebar" />
        <!-- 标签页 -->
        <tags-view />
        <!-- 主内容区 -->
        <app-main />
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'

import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'
import AppMain from './components/AppMain.vue'
import TagsView from './components/TagsView.vue'

// 侧边栏折叠状态
const isSidebarCollapsed = ref(false)

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// ✅ 全局刷新方法
const handleGlobalRefresh = () => {
  // 触发页面刷新
  const event = new CustomEvent('global-refresh')
  window.dispatchEvent(event)
}

// 提供布局状态给子组件
provide('layoutState', {
  isSidebarCollapsed,
  toggleSidebar,
})

// ✅ 提供刷新方法给所有子组件
provide('globalRefresh', handleGlobalRefresh)
</script>

<style scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;
}
</style>
