<!--
  主布局组件 MainLayout
  - 负责页面整体布局：侧边栏、头部、标签页与主内容区
  - 通过 provide 将布局状态和全局刷新方法注入给子组件
-->
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
// 主布局逻辑：控制侧边栏折叠与提供全局刷新/状态给子组件
import { ref, provide } from 'vue'

import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'
import AppMain from './components/AppMain.vue'
import TagsView from './components/TagsView.vue'

// 侧边栏折叠状态（提供给子组件用于 UI 渲染）
const isSidebarCollapsed = ref(false)

// 切换侧边栏折叠状态的回调，由头部或侧边栏触发
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
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
