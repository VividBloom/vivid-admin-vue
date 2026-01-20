<!--
  辅助组件 SidebarItem
  - 递归渲染菜单项：支持无子菜单的 `el-menu-item` 与含子菜单的 `el-sub-menu`
  - 接受一个 `item` prop，结构包含 path、meta.title、可选的 children
-->
<template>
  <!-- 没有子菜单的菜单项 -->
  <el-menu-item v-if="!item.children || item.children.length === 0" :index="item.path">
    <el-icon v-if="item.meta?.icon">
      <component :is="item.meta.icon" />
    </el-icon>
    <template #title>
      <span>{{ item.meta?.title }}</span>
    </template>
  </el-menu-item>

  <!-- 有子菜单的菜单项 -->
  <el-sub-menu v-else :index="item.path">
    <template #title>
      <el-icon v-if="item.meta?.icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <span>{{ item.meta?.title }}</span>
    </template>

    <!-- 递归渲染子菜单 -->
    <SidebarItem v-for="child in item.children" :key="child.path" :item="child" />
  </el-sub-menu>
</template>

<script setup lang="ts">
// 菜单项类型定义与 Props 说明
interface MenuItem {
  path: string
  meta?: {
    title: string
    icon?: string
  }
  children?: MenuItem[]
}

interface Props {
  item: MenuItem
}

defineProps<Props>()
</script>
