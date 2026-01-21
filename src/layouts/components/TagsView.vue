<!--
  标签页组件 TagsView
  - 显示已访问的页面标签（支持固定标签、关闭、刷新、右键菜单等操作）
  - 与 tagsView store 协作：维护 visitedViews、cachedViews 以及刷新标记
-->
<template>
  <div class="tags-view-container">
    <el-scrollbar ref="scrollbarRef" class="tags-view-scrollbar">
      <router-link
        v-for="tag in visitedViews"
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
          <el-icon
            v-if="!tag.affix && !isSmallScreen"
            class="close-icon"
            @click.prevent.stop="handleClose(tag)"
          >
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
// TagsView 逻辑：管理标签的新增/关闭/刷新以及右键菜单操作
import { ref, computed, onMounted, watch, nextTick, inject, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sortable from 'sortablejs'
import { useTagsViewsStore, type TagView } from '@/stores/tagsView'
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'

// 依赖注入：从 AppMain 注入的刷新方法（reloadCurrentPage）
const reloadCurrentPage = inject('reloadCurrentPage') as () => Promise<void>

const route = useRoute()
const router = useRouter()

const tagsViewStore = useTagsViewsStore()
const appStore = useAppStore()

const scrollbarRef = ref()
const contextMenuVisible = ref(false)
const contextMenuLeft = ref(0)
const contextMenuTop = ref(0)
const contextMenuTag = ref<TagView | null>(null)

const refreshLoading = ref(false) // 刷新加载状态

// 从 store 获取访问过的标签
const visitedViews = computed(() => tagsViewStore.visitedViews)
const isSmallScreen = computed(() => appStore.isSmallScreen)

let sortableInstance: Sortable | null = null

// 拖拽排序相关逻辑
const initSortable = () => {
  const el = document.querySelector('.tags-view-scrollbar .el-scrollbar__view') as HTMLElement
  if (!el) return

  sortableInstance = Sortable.create(el, {
    animation: 150,
    filter: '.affix', // 禁止拖拽固定标签
    onMove: evt => {
      // 禁止拖拽到固定标签位置之前（即禁止插入到固定标签前面）
      // 如果目标元素是固定标签，则不允许放置
      return !evt.related.classList.contains('affix')
    },
    onEnd: evt => {
      const { newIndex, oldIndex } = evt
      if (newIndex === undefined || oldIndex === undefined || newIndex === oldIndex) return

      // 复制并重新排序
      const copy = [...visitedViews.value]
      const targetRow = copy.splice(oldIndex, 1)[0]
      if (targetRow) {
        copy.splice(newIndex, 0, targetRow)
        // 更新 store
        tagsViewStore.updateVisitedViews(copy)
      }
    },
  })
}

// 判断标签是否为当前激活路由
const isActive = (tag: TagView) => tag.path === route.path

// 点击标签：中键点击可以关闭非固定标签，否则跳转
const handleTagClick = (tag: TagView, e: MouseEvent) => {
  if (e.button === 1 && !tag.affix) {
    handleClose(tag)
    return
  }
  router.push({ path: tag.path, query: tag.query })
}

// 关闭标签并在必要时切换到相邻标签或首页
const handleClose = async (tag: TagView) => {
  if (tag.affix) {
    ElMessage.warning('固定标签不能关闭')
    return
  }

  const index = visitedViews.value.findIndex(v => v.path === tag.path)
  const success = await tagsViewStore.delView(tag)
  if (success) {
    const nextTag = visitedViews.value[index] || visitedViews.value[index - 1]
    if (isActive(tag)) {
      if (index >= 0 && nextTag) {
        router.push({ path: nextTag.path, query: nextTag.query })
        return
      }
      router.push('/')
    }
  }
}

// 刷新选中标签（只刷新组件，不重载整个页面）
const refreshSelectedTag = async () => {
  try {
    refreshLoading.value = true
    const currentTag = contextMenuTag.value || visitedViews.value.find(v => isActive(v))
    if (!currentTag) {
      ElMessage.warning('没有可刷新的页面')
      return
    }

    // 标记需要刷新，组件根据标记刷新自己
    tagsViewStore.markViewForRefresh(currentTag.path)

    const messageInstance = ElMessage.info({ message: '正在刷新....', duration: 0 })

    // 优先使用注入的刷新方法（AppMain 提供），否则通过路由强制刷新
    if (reloadCurrentPage) {
      await reloadCurrentPage()
    } else {
      await router.push({ path: currentTag.path, query: { _t: Date.now() } })
    }

    messageInstance.close()
    ElMessage.success({ message: '刷新完成', duration: 2000 })
  } catch (e) {
    console.error('刷新页面失败:', e)
    ElMessage.error('刷新页面失败')
  } finally {
    // 可选地延迟清除刷新标记，给予组件时间完成更新
    setTimeout(() => {
      if (contextMenuTag.value) tagsViewStore.clearRefreshFlag(contextMenuTag.value.path)
    }, 1000)
    refreshLoading.value = false
    contextMenuVisible.value = false
    contextMenuTag.value = null
  }
}

// 其余右键菜单相关操作（关闭、关闭其他、关闭左右、关闭全部），在操作前清理刷新标记
const closeSelectedTag = () => {
  if (contextMenuTag.value) {
    tagsViewStore.clearRefreshFlag(contextMenuTag.value.path)
    handleClose(contextMenuTag.value)
  }
  contextMenuVisible.value = false
  contextMenuTag.value = null
}

const closeOtherTags = () => {
  if (contextMenuTag.value) {
    tagsViewStore.clearRefreshFlag(contextMenuTag.value.path)
    tagsViewStore.delOtherViews(contextMenuTag.value)
    if (!isActive(contextMenuTag.value)) {
      router.push({ path: contextMenuTag.value.path, query: contextMenuTag.value.query })
    }
  }
  contextMenuVisible.value = false
  contextMenuTag.value = null
}

const closeLeftTags = () => {
  if (contextMenuTag.value) {
    tagsViewStore.clearRefreshFlag(contextMenuTag.value.path)
    tagsViewStore.delLeftViews(contextMenuTag.value)
    if (!isActive(contextMenuTag.value)) {
      router.push({ path: contextMenuTag.value.path, query: contextMenuTag.value.query })
    }
  }
  contextMenuVisible.value = false
  contextMenuTag.value = null
}

const closeRightTag = () => {
  if (contextMenuTag.value) {
    tagsViewStore.clearRefreshFlag(contextMenuTag.value.path)
    tagsViewStore.delRightViews(contextMenuTag.value)
    if (!isActive(contextMenuTag.value)) {
      router.push({ path: contextMenuTag.value.path, query: contextMenuTag.value.query })
    }
  }
  contextMenuVisible.value = false
  contextMenuTag.value = null
}

const closeAllTags = () => {
  tagsViewStore.delAllViews()
  router.push('/')
  contextMenuVisible.value = false
  contextMenuTag.value = null
}

// 打开右键菜单并记录目标 tag 与坐标
const openContextMenu = (tag: TagView, e: MouseEvent) => {
  contextMenuTag.value = tag
  contextMenuLeft.value = e.clientX
  contextMenuTop.value = e.clientY
  contextMenuVisible.value = true
}

// 路由变化时自动向 tags store 添加标签
watch(
  () => route.path,
  newPath => {
    if (newPath) tagsViewStore.addView(route)
  }
)

// 点击页面其它位置关闭上下文菜单
const closeContextMenu = (e: MouseEvent) => {
  if (!(e.target as HTMLElement).closest('.contextmenu')) {
    contextMenuVisible.value = false
    nextTick(() => (contextMenuTag.value = null))
  }
}

onMounted(() => {
  initSortable()
  // 首次确保仪表盘为固定标签
  tagsViewStore.addView({
    path: '/dashboard',
    fullPath: '/dashboard',
    meta: { title: '仪表盘', affix: true },
    name: 'Dashboard',
  } as any)
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
  document.removeEventListener('click', closeContextMenu)
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
  vertical-align: middle;
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
  background-color: #5479b1;
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
