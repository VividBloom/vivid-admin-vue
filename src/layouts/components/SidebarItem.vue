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
