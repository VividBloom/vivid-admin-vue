<!--
  侧边栏组件 AppSidebar
  - 渲染应用的侧边导航，支持折叠模式与动态菜单数据
  - 通过 `collapse` prop 控制迷你模式显示
-->
<template>
  <component
    :is="mode === 'vertical' ? 'el-aside' : 'div'"
    :width="mode === 'vertical' ? sidebarWidth : '100%'"
    class="sidebar-container"
    :class="{ 'sidebar-collapsed': collapse, 'is-horizontal': mode === 'horizontal' }"
  >
    <!-- Logo 区域 -->
    <div v-if="appStore.settings.showLogo" class="sidebar-logo" @click="$router.push('/')">
      <img src="@/assets/logo.png" alt="logo" class="logo-image" />
      <span v-show="!collapse && mode !== 'horizontal'" class="logo-text">{{
        $t('app.title')
      }}</span>
    </div>
    <!-- 菜单区域 -->
    <el-scrollbar class="sidebar-scrollbar" :class="{ 'is-horizontal': mode === 'horizontal' }">
      <el-menu
        class="sidebar-menu"
        :default-active="activeMenu"
        :collapse="mode === 'vertical' && collapse"
        :mode="mode"
        :unique-opened="true"
        router
        background-color="#001529"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <!-- 动态生成菜单 -->
        <sidebar-item v-for="item in menuRoutes" :key="item.path || item.id" :item="item" />
      </el-menu>
    </el-scrollbar>

    <!-- 折叠按钮 (仅垂直模式显示) -->
    <div v-if="mode === 'vertical'" class="sidebar-trigger" @click="$emit('toggle-collapse')">
      <el-icon>
        <component :is="collapse ? 'Expand' : 'Fold'" />
      </el-icon>
    </div>
  </component>
</template>

<script setup lang="ts">
// 侧边栏脚本说明：负责根据应用配置渲染菜单并暴露折叠切换事件
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'

import SidebarItem from './SidebarItem.vue'

interface Props {
  collapse: boolean
  mode?: 'vertical' | 'horizontal'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'vertical',
})
defineEmits<{
  'toggle-collapse': []
}>()

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

// 根据折叠状态动态设置侧边栏宽度
const sidebarWidth = computed(() => (props.collapse ? '64px' : '200px'))
// 当前激活菜单项（用于 el-menu 的默认高亮）
const activeMenu = computed(() => route.path)
// 从权限 store 中读取用户菜单
const menuRoutes = computed(() => {
  const dashboard = {
    id: -1,
    name: 'route.dashboard',
    path: '/dashboard',
    icon: 'Odometer',
  }
  const menus = permissionStore.userMenus || []
  const filtered = menus.filter(m => m.path !== '/dashboard')
  return [dashboard, ...filtered]
})
</script>

<style scoped>
.sidebar-container {
  background-color: #1a2332;
  transition: width 0.3s ease;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  padding: 0 20px;
  color: white;
  cursor: pointer;
  border-bottom: 1px solid #2a3441;
}

.logo-image {
  width: 32px;
  height: 32px;
}

.logo-text {
  margin-left: 12px;
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
}

.sidebar-scrollbar {
  height: calc(100vh - 120px);
}

.sidebar-menu {
  border: none;
}

.sidebar-trigger {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  background-color: #0f1419;
  border-top: 1px solid #2a3441;
}

.sidebar-trigger:hover {
  background-color: #0a0e12;
}

/* 水平模式样式适配 */
.sidebar-container.is-horizontal {
  width: 100% !important;
  height: 60px;
  display: flex;
  align-items: center;
  transition: none;
}

.sidebar-container.is-horizontal .sidebar-logo {
  width: auto;
  border-bottom: none;
  background: transparent;
}

.sidebar-scrollbar.is-horizontal {
  height: 60px;
  flex: 1;
  /* 确保横向滚动正常工作 */
  white-space: nowrap;
}

.sidebar-container.is-horizontal .sidebar-menu {
  height: 60px;
  display: flex;
  align-items: center;
  width: 100%;
}

.sidebar-container.is-horizontal :deep(.el-scrollbar__wrap) {
  overflow-x: auto;
  overflow-y: hidden;
}

.sidebar-container.is-horizontal :deep(.el-menu--horizontal) {
  border-bottom: none;
  width: 100%;
}
</style>
