<!--
  辅助组件 SidebarItem
  - 递归渲染菜单项：支持无子菜单的 `el-menu-item` 与含子菜单的 `el-sub-menu`
  - 接受一个 `item` prop，结构包含 path、name、可选的 children
-->
<template>
  <!-- 没有子菜单的菜单项 -->
  <el-menu-item v-if="!item.children || item.children.length === 0" :index="item.path || ''">
    <el-icon v-if="item.icon">
      <component :is="item.icon" />
    </el-icon>
    <template #title>
      <span>{{ $t(item.name) }}</span>
    </template>
  </el-menu-item>

  <!-- 有子菜单的菜单项 -->
  <el-sub-menu v-else :index="item.path || ''">
    <template #title>
      <el-icon v-if="item.icon">
        <component :is="item.icon" />
      </el-icon>
      <span>{{ $t(item.name) }}</span>
    </template>

    <!-- 递归渲染子菜单 -->
    <SidebarItem v-for="child in item.children" :key="child.path || child.id" :item="child" />
  </el-sub-menu>
</template>

<script setup lang="ts">
// 菜单项类型定义与 Props 说明
interface MenuItem {
  id: number
  name: string
  path?: string
  icon?: string
  children?: MenuItem[]
}

interface Props {
  item: MenuItem
}

defineProps<Props>()
</script>
