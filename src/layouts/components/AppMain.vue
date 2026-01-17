<template>
  <el-main ref="scrollContainerRef" class="main-container">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="componentKey(route)" ref="pageComponentRef" />
        </keep-alive>
      </transition>
    </router-view>
  </el-main>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, provide, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTagsViewsStore } from '@/stores/tagsView'
import { useScrollRecover } from '@/composables/useScrollRecover'

const route = useRoute()
const tagsViewStore = useTagsViewsStore()

const pageComponentRef = ref()

const scrollContainerRef = ref(null) // 引用正确的滚动容器

// 组件刷新控制
const refreshMap = ref<Record<string, number>>({})

// 缓存的视图组件
const cachedViews = computed(() => tagsViewStore.cachedViews || [])

// 计算组件 key - 通过时间戳实现强制刷新
const componentKey = (routeObj: any) => {
  const routePath = routeObj?.fullPath || routeObj?.path || route.fullPath

  if (!routePath) return 'default-key'

  // ✅ 使用 getRefreshFlag 获取刷新标记
  const refreshFlag = tagsViewStore.getRefreshFlag(routePath)
  // 组合路由路径和刷新标记作为key
  return `${routePath}-${refreshFlag}`
}

// 动态key, 刷新法
const refreshByKey = async () => {
  const currentPage = route.fullPath
  if (!currentPage) {
    console.warn('无法获取当前路由路径')
    return
  }
  // ✅ 使用 markViewForRefresh 标记当前页面需要刷新
  tagsViewStore.markViewForRefresh(currentPage)
  // 添加一个小的延迟, 确保标记被应用
  await new Promise(resolve => setTimeout(resolve, 50))
  window.dispatchEvent(
    new CustomEvent('page-refreshed', {
      detail: {
        path: currentPage,
        timestamp: Date.now(),
      },
    })
  )
  console.log('✅ 通过动态 Key 刷新页面')
  await nextTick()
}

// 方法二：状态控制刷新法
const refreshByMethod = async () => {
  // 这里可以通过事件总线或 provide/inject 调用组件的刷新方法
  console.log('✅ 通过状态控制刷新页面')
  // 触发全局刷新事件
  const event = new CustomEvent('page-refresh', { detail: { path: route.path } })
  window.dispatchEvent(event)
}

// 提供刷新方法给子组件
const reloadCurrentPage = async () => {
  // 默认使用方法一
  await refreshByKey()
}

// 提供刷新方法给子组件使用
provide('reloadCurrentPage', reloadCurrentPage)

// ✅ 监听页面刷新完成事件
const handlePageRefreshed = (event: CustomEvent) => {
  const { path, timestamp } = event.detail
  console.log(`页面刷新完成事件: ${path} at ${timestamp}`)

  // 刷新完成后, 可以选择延迟清除标记
  setTimeout(() => {
    tagsViewStore.clearRefreshFlag(path)
  })
}

onMounted(() => {
  // 使用滚动恢复 Hook
  useScrollRecover(ref(scrollContainerRef.value?.$el), {
    throttleDelay: 150,
  })

  window.addEventListener('page-refreshed', handlePageRefreshed as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('page-refreshed', handlePageRefreshed as EventListener)
})

// 监听路由变化，更新 reloadMap
watch(
  () => route.fullPath,
  (newFullPath, oldPath) => {
    if (oldPath) {
      setTimeout(() => {
        // 自动清除过期的刷新标记
        tagsViewStore.clearRefreshFlag(oldPath)
      })
    }
    // 确保每个路由都有唯一的key
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
  /* background-color: #f5f7fa; */
  height: calc(100vh - 96px);
  overflow-y: auto;
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
