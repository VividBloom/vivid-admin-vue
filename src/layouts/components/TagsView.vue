<template>
  <div class="tags-view-container">
    <el-scrollbar ref="scrollbarRef" class="tags-view-scrollbar">
      <router-link
        v-for="tag in visitedViews.sort((v1, v2) => v1.seq - v2.seq)"
        :key="tag.path"
        :to="{ path: tag.path, query: tag.query }"
        custom
      >
        <div
          class="tags-view-item"
          :class="{
            active: isActive(tag),
            affix: tag.affix,
            'contextmenu-active': contextMenuTag?.path === tag.path,
          }"
          @click="handleTagClick(tag, $event)"
          @contextmenu.prevent="openContextMenu(tag, $event)"
        >
          <el-icon v-if="tag.meta?.icon" class="tag-icon">
            <component :is="tag.meta.icon"></component>
          </el-icon>
          <span class="tag-title">{{ tag.title }}</span>
          <el-icon v-if="!tag.affix" class="close-icon" @click.prevent.stop="handleClose(tag)">
            <Close />
          </el-icon>
        </div>
      </router-link>
    </el-scrollbar>
    <!-- 右键菜单 -->
    <ul
      v-show="contextMenuVisible"
      class="contextmenu"
      :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
    >
      <li @click="refreshSelectedTag">
        <el-icon><Refresh /></el-icon>刷新
      </li>
      <li @click="closeSelectedTag">
        <el-icon><Close /></el-icon>关闭
      </li>
      <li @click="closeOtherTags">
        <el-icon><CircleClose /></el-icon>关闭其他
      </li>
      <li @click="closeLeftTags">
        <el-icon><ArrowLeft /></el-icon>关闭左侧
      </li>
      <li @click="closeRightTag">
        <el-icon><ArrowRight /></el-icon>关闭右侧
      </li>
      <li @click="closeAllTags">
        <el-icon><Delete /></el-icon>关闭全部
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewsStore, type TagView } from '@/stores/tagsView'
import { ElMessage } from 'element-plus'

// 依赖注入：获取刷新页面的方法
const reloadCurrentPage = inject('reloadCurrentPage') as () => Promise<void>

const route = useRoute()
const router = useRouter()

const tagsViewStore = useTagsViewsStore()

const scrollbarRef = ref()
const contextMenuVisible = ref(false)
const contextMenuLeft = ref(0)
const contextMenuTop = ref(0)
const contextMenuTag = ref<TagView | null>(null)

const refreshLoading = ref(false) // 刷新加载状态

// 获取访问过的标签
const visitedViews = computed(() => tagsViewStore.visitedViews)

// 检查是否是当前激活的标签
const isActive = (tag: TagView) => {
  return tag.path === route.path
}

// 标签点击
const handleTagClick = (tag: TagView, e: MouseEvent) => {
  // 如果是鼠标中键点击, 只有非固定标签才关闭
  if (e.button === 1 && !tag.affix) {
    handleClose(tag)
    return
  }

  router.push({
    path: tag.path,
    query: tag.query,
  })
}

// 关闭标签
const handleClose = async (tag: TagView) => {
  if (tag.affix) {
    // 固定标签不能关闭
    ElMessage.warning('固定标签不能关闭')
    return
  }

  const index = visitedViews.value.findIndex(v => v.path === tag.path)
  const success = await tagsViewStore.delView(tag)
  if (success) {
    const nextTag = visitedViews.value[index] || visitedViews.value[index - 1]
    // 如果关闭的是当前页面, 跳转到相邻的标签
    if (isActive(tag)) {
      if (index >= 0 && nextTag) {
        router.push({
          path: nextTag.path,
          query: nextTag.query,
        })
        return
      }
      // 没有其他标签, 跳转到首页
      router.push('/')
    }
  }
}

// 刷新选中标签 - 只刷新当前页面组件，不刷新整个页面
const refreshSelectedTag = async () => {
  try {
    refreshLoading.value = true
    // 获取当前激活的标签
    const currentTag = contextMenuTag.value || visitedViews.value.find(v => isActive(v))
    if (!currentTag) {
      ElMessage.warning('没有可刷新的页面')
      return
    }

    // 1. ✅ 使用 markViewForRefresh 标记需要刷新的视图
    tagsViewStore.markViewForRefresh(currentTag.path)

    // 显示刷新提示
    const messageInstance = ElMessage.info({
      message: '正在刷新....',
      duration: 0, // 持续显示直到手动关闭
    })

    // 使用依赖注入的刷新方法
    if (reloadCurrentPage) {
      await reloadCurrentPage()
    } else {
      // 否则手动触发路由跳转
      await router.push({
        path: currentTag.path,
        query: { _t: Date.now() }, // 添加时间戳参数强制刷新
      })
    }

    // 关闭提示
    messageInstance.close()

    // 显示碾消息
    ElMessage.success({
      message: '刷新完成,',
      duration: 2000,
    })
    console.log('✅ 已刷新页面: ${currentTag.title}')
  } catch (e) {
    console.error('❌ 刷新页面失败:', e)
    ElMessage.error('刷新页面失败')
  } finally {
    // 2. ✅ 可选：清除刷新标记
    setTimeout(() => {
      if (contextMenuTag.value) {
        tagsViewStore.clearRefreshFlag(contextMenuTag.value.path)
      }
    }, 1000)
    refreshLoading.value = false
    contextMenuVisible.value = false
    contextMenuTag.value = null
  }
}

// 关闭当前标签
const closeSelectedTag = () => {
  if (contextMenuTag.value) {
    // 在关闭标签前清除其刷新标记
    tagsViewStore.clearRefreshFlag(contextMenuTag.value.path)
    handleClose(contextMenuTag.value)
  }
  contextMenuVisible.value = false
  contextMenuTag.value = null
}

// 关闭其他标签
const closeOtherTags = () => {
  if (contextMenuTag.value) {
    // 在关闭标签前清除其刷新标记
    tagsViewStore.clearRefreshFlag(contextMenuTag.value.path)
    tagsViewStore.delOtherViews(contextMenuTag.value)
    if (!isActive(contextMenuTag.value)) {
      router.push({
        path: contextMenuTag.value.path,
        query: contextMenuTag.value.query,
      })
    }
  }
  contextMenuVisible.value = false
  contextMenuTag.value = null
}

// 关闭左侧标签
const closeLeftTags = () => {
  if (contextMenuTag.value) {
    // 在关闭标签前清除其刷新标记
    tagsViewStore.clearRefreshFlag(contextMenuTag.value.path)
    tagsViewStore.delLeftViews(contextMenuTag.value)
    if (!isActive(contextMenuTag.value)) {
      router.push({
        path: contextMenuTag.value.path,
        query: contextMenuTag.value.query,
      })
    }
  }
  contextMenuVisible.value = false
  contextMenuTag.value = null
}

// 关闭右侧标签
const closeRightTag = () => {
  if (contextMenuTag.value) {
    // 在关闭标签前清除其刷新标记
    tagsViewStore.clearRefreshFlag(contextMenuTag.value.path)
    tagsViewStore.delRightViews(contextMenuTag.value)
    if (!isActive(contextMenuTag.value)) {
      router.push({
        path: contextMenuTag.value.path,
        query: contextMenuTag.value.query,
      })
    }
  }
  contextMenuVisible.value = false
  contextMenuTag.value = null
}

// 关闭所有标签
const closeAllTags = () => {
  tagsViewStore.delAllViews()
  router.push('/')
  contextMenuVisible.value = false
  contextMenuTag.value = null
}

// 打开右键菜单
const openContextMenu = (tag: TagView, e: MouseEvent) => {
  contextMenuTag.value = tag
  contextMenuLeft.value = e.clientX
  contextMenuTop.value = e.clientY
  contextMenuVisible.value = true
}

// 监听路由变化, 添加标签
watch(
  () => route.path,
  newPath => {
    if (newPath) {
      tagsViewStore.addView(route)
    }
  }
)

// 点击其他地方关闭右键菜单
const closeContextMenu = (e: MouseEvent) => {
  if (!(e.target as HTMLElement).closest('.contextmenu')) {
    contextMenuVisible.value = false
    nextTick(() => {
      contextMenuTag.value = null
    })
  }
}

onMounted(() => {
  // 添加首页为固定标签
  tagsViewStore.addView({
    path: '/dashboard',
    fullPath: '/dashboard',
    meta: {
      title: '仪表盘',
      affix: true,
    },
    name: 'Dashboard',
  } as any)

  document.addEventListener('click', closeContextMenu)
})
</script>

<style scoped>
.tags-view-container {
  height: 36px;
  width: 100%;
  /* background: #fff; */
  border-bottom: 1px solid #d8dce5;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.12),
    0 0 3px 0 rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 100;
}

.tags-view-scrollbar {
  width: 100%;
  height: 100%;
}

.tags-view-scrollbar :deep(.el-scrollbar__wrap) {
  overflow-x: auto;
  overflow-y: hidden;
}

.tags-view-item {
  display: inline-flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  height: 26px;
  line-height: 26px;
  border: 1px solid #d8dce5;
  /* color: #495060; */
  /* background: #fff; */
  padding: 0 8px;
  font-size: 12px;
  margin-left: 5px;
  margin-top: 4px;
  border-radius: 3px;
  user-select: none;
  transition: all 0.3s ease;
}

.tags-view-item:first-child {
  margin-left: 10px;
}

.tags-view-item:hover {
  background-color: #f0f2f5;
}

.tags-view-item.active {
  background-color: #409eff;
  color: #fff;
  border-color: #409eff;
}

/* 固定标签的特殊样式 */
.tags-view-item.affix {
  /* background-color: #f0f9ff; */
  border-color: #b3d9ff;
  /* color: #409eff; */
}

.tags-view-item.affix.active {
  background-color: #409eff;
  color: #fff;
  border-color: #409eff;
}

.tags-view-item.active::before {
  content: '';
  background: #fff;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: relative;
  margin-right: 2px;
}

/* 右键激活状态样式 */
.tags-view-item.contextmenu-active {
  background-color: #f0f2f5 !important;
  border-color: #409eff !important;
  color: #409eff !important;
  z-index: 10;
}

.tags-view-item.affix.contextmenu-active {
  background-color: #e6f7ff !important;
  border-color: #69c0ff !important;
  color: #1890ff !important;
}

.tag-icon {
  margin-right: 4px;
  font-size: 14px;
}

.tag-title {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 4px;
}

.close-icon {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  text-align: center;
  line-height: 14px;
  transition: all 0.3s;
  opacity: 0.7;
  margin-left: 4px;
}

.close-icon:hover {
  background-color: #c0c4cc;
  color: #fff;
  opacity: 1;
}

.tags-view-item.active .close-icon:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.contextmenu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: fixed;
  list-style-type: none;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
  min-width: 120px;
}

.contextmenu li {
  margin: 0;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.contextmenu li:hover {
  background: #eee;
}
</style>
