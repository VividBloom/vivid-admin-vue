<template>
  <el-aside
    :width="sidebarWidth"
    class="sidebar-container"
    :class="{ 'sidebar-collapsed': collapse }"
  >
    <!-- Logo 区域 -->
    <div class="sidebar-logo" @click="$router.push('/')">
      <img src="@/assets/logo.png" alt="logo" class="logo-image" />
      <span v-show="!collapse" class="logo-text">Vue3 Admin</span>
    </div>
    <!-- 菜单区域 -->
    <el-scrollbar class="sidebar-scrollbar">
      <el-menu
        class="sidebar-menu"
        :default-active="activeMenu"
        :collapse="collapse"
        :unique-opened="true"
        router
        background-color="#001529"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <!-- 动态生成菜单 -->
        <sidebar-item v-for="item in menuRoutes" :key="item.path" :item="item" />
      </el-menu>
    </el-scrollbar>

    <!-- 折叠按钮 -->
    <div class="sidebar-trigger" @click="$emit('toggle-collapse')">
      <el-icon>
        <component :is="collapse ? 'Expand' : 'Fold'" />
      </el-icon>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { computed, type Prop } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

import SidebarItem from './SidebarItem.vue'

interface Props {
  collapse: boolean
}

const props = defineProps<Props>()
defineEmits<{
  'toggle-collapse': []
}>()

const route = useRoute()
const appStore = useAppStore()

// 计算侧边栏宽度
const sidebarWidth = computed(() => (props.collapse ? '64px' : '200px'))
// 当前激活的菜单
const activeMenu = computed(() => route.path)
// 菜单路由数据
const menuRoutes = computed(() => appStore.menuRoutes)
</script>

<style scoped>
.sidebar-container {
  background-color: #001529;
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
  border-bottom: 1px solid #002140;
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
  background-color: #002140;
  border-top: 1px solid #002140;
}

.sidebar-trigger:hover {
  background-color: #001a35;
}
</style>
