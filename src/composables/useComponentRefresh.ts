import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 方法二：状态控制刷新法的实现
 * 组件可以通过这个 hook 实现内部数据的刷新
 */
export function useComponentRefresh() {
  const refreshKey = ref(0)
  const isRefreshing = ref(false)

  // 刷新组件数据
  const refreshComponent = async () => {
    isRefreshing.value = true
    refreshKey.value++

    try {
      // 这里可以调用组件的数据加载方法
      // console.log('组件数据刷新中...')
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 300))
    } finally {
      isRefreshing.value = false
    }
  }

  // 监听全局刷新事件
  const handleGlobalRefresh = () => {
    refreshComponent()
  }

  onMounted(() => {
    window.addEventListener('global-refresh', handleGlobalRefresh)
  })

  onUnmounted(() => {
    window.removeEventListener('global-refresh', handleGlobalRefresh)
  })

  return {
    refreshKey,
    isRefreshing,
    refreshComponent,
  }
}
