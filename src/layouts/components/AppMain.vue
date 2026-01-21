<!--
  主内容区域组件 AppMain
  - 负责渲染路由出口，支持 keep-alive 缓存与基于刷新标记的局部刷新策略
  - 提供 `reloadCurrentPage` 给子组件用于触发刷新
-->
<template>
  <el-main ref="scrollContainerRef" class="main-container">
    <router-view v-slot="{ Component, route: slotRoute }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="componentKey(slotRoute)" ref="pageComponentRef" />
        </keep-alive>
      </transition>
    </router-view>
  </el-main>
</template>

<script setup lang="ts">
// 主内容区：负责渲染路由组件，支持 keep-alive 缓存以及基于刷新标记的局部刷新
import { ref, computed, nextTick, provide, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTagsViewsStore } from '@/stores/tagsView'
import { useScrollRecover } from '@/composables/useScrollRecover'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const tagsViewStore = useTagsViewsStore()

const pageComponentRef = ref()

// 主滚动容器引用（用于滚动恢复）
const scrollContainerRef = ref<any>(null)

// 组件刷新控制（可以用来记录每个路由的刷新状态）
const refreshMap = ref<Record<string, number>>({})

// 从 tagsViewStore 获取需要缓存的组件名列表（用于 keep-alive include）
const cachedViews = computed(() => tagsViewStore.cachedViews || [])

// 通过组合路由路径与刷新标记生成组件 key，刷新标记变化时强制重新渲染组件
const componentKey = (routeObj: any) => {
  const routePath = routeObj?.fullPath || routeObj?.path || route.fullPath
  if (!routePath) return 'default-key'
  const refreshFlag = tagsViewStore.getRefreshFlag(routePath)
  return `${routePath}-${refreshFlag}`
}

// 刷新方法一：通过设置刷新标记并派发事件，页面组件会根据标记变化更新 key
const refreshByKey = async () => {
  const currentPage = route.fullPath
  if (!currentPage) {
    console.warn(t('app.cannotGetRoutePath'))
    return
  }
  tagsViewStore.markViewForRefresh(currentPage)
  await new Promise(resolve => setTimeout(resolve, 50))
  window.dispatchEvent(
    new CustomEvent('page-refreshed', { detail: { path: currentPage, timestamp: Date.now() } })
  )
  await nextTick()
}

// 刷新方法二：通过派发全局事件或状态控制来触发子组件刷新（可选实现）
const refreshByMethod = async () => {
  const event = new CustomEvent('page-refresh', { detail: { path: route.path } })
  window.dispatchEvent(event)
}

// 提供给子组件的刷新接口（默认使用 refreshByKey）
const reloadCurrentPage = async () => {
  await refreshByKey()
}

provide('reloadCurrentPage', reloadCurrentPage)

// 监听页面刷新完成事件，清理刷新标记
const handlePageRefreshed = (event: CustomEvent) => {
  const { path } = event.detail
  setTimeout(() => tagsViewStore.clearRefreshFlag(path))
}

onMounted(() => {
  // 启用滚动恢复功能（保持页面滚动位置）
  useScrollRecover(ref(scrollContainerRef.value?.$el), { throttleDelay: 150 })
  window.addEventListener('page-refreshed', handlePageRefreshed as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('page-refreshed', handlePageRefreshed as EventListener)
})

// 路由变化时，清理旧路由的刷新标记并维护 refreshMap
watch(
  () => route.fullPath,
  (newFullPath, oldPath) => {
    if (oldPath) {
      setTimeout(() => tagsViewStore.clearRefreshFlag(oldPath))
    }
    if (refreshMap.value[newFullPath]) {
      refreshMap.value[newFullPath] = 0
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.main-container {
  padding: 20px;
  /* background-color: #f8f9fa; */
  height: calc(100vh - 96px);
  overflow-y: auto;
}

@media (max-width: 767px) {
  .main-container {
    padding: 10px;
  }
}

/* 页面切换动画 */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
