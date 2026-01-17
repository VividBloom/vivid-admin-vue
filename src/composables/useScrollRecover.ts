import { ref, onMounted, onUnmounted } from 'vue'

import { useRoute } from 'vue-router'
import { throttle } from 'lodash-es'

/**
 * 滚动位置恢复 Hook
 * @param scrollElementRef 可滚动元素的 ref
 * @param options 配置选项
 */
export function useScrollRecover(
  scrollElementRef: Ref<HTMLElement | null>,
  options: { throttleDelay?: number; storageKey?: string } = {}
) {
  const route = useRoute()
  const scrollPosition = ref(0)

  const { throttleDelay = 100, storageKey = `scroll_pos_${route.path}` } = options

  // 保存滚动位置
  const saveScrollPosition = throttle((path: string) => {
    if (!scrollElementRef.value) {
      return
    }
    const saveKey = `scroll_pos_${path}`
    scrollPosition.value = scrollElementRef.value.scrollTop
    // 同时保存到sessionStorage, 防止页面刷新丢失
    sessionStorage.setItem(saveKey, scrollPosition.value.toString())
  }, throttleDelay)

  // 恢复滚动位置
  const restoreScrollPosition = (path?: string) => {
    let searchKey = storageKey
    if (path) {
      searchKey = `scroll_pos_${path}`
    }
    const savePosition = sessionStorage.getItem(searchKey)
    if (savePosition && scrollElementRef.value) {
      const position = parseInt(savePosition)
      scrollElementRef.value.scrollTop = position
      scrollPosition.value = position
    }
  }

  watch(
    () => route.fullPath,
    async (newFullPath, oldPath) => {
      saveScrollPosition(oldPath as string)
      await nextTick()
      setTimeout(() => {
        restoreScrollPosition(newFullPath)
      }, 500)
    },
    { immediate: true }
  )

  onMounted(() => {
    if (scrollElementRef.value) {
      scrollElementRef.value.addEventListener('scroll', () => {
        saveScrollPosition(route.path as string)
      })

      // 组件挂载时恢复位置
      setTimeout(restoreScrollPosition, 50)
    }
  })

  // 清理事件监听
  onUnmounted(() => {
    if (scrollElementRef.value) {
      scrollElementRef.value.removeEventListener('scroll', () => {
        saveScrollPosition(route.path as string)
      })
    }
  })

  // keep-alive 组件激活时恢复
  // onDeactivated(() => {
  //   saveScrollPosition(route.path as string)
  // })

  return {
    scrollPosition,
    saveScrollPosition,
    restoreScrollPosition,
  }
}
