import { defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'

export interface TagView {
  title: string
  path: string
  fullPath: string
  name?: string
  affix?: boolean // 是否固定标签(如首页)
  query?: any
  meta?: {
    icon?: string | null
  }
  seq: number
}

export const useTagsViewsStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: [] as TagView[],
    cachedViews: [] as string[],
    refreshFlags: {} as Record<string, number>, // 记录刷新时间戳
  }),

  getters: {
    // 当前激活的标签
    activeView: state => {
      return state.visitedViews.find(view => view.path === window.location.pathname)
    },
  },

  actions: {
    // 添加标签
    addView(view: RouteLocationNormalized) {
      if (!view.meta?.keepAlive) {
        return
      }
      const tagView: TagView = {
        title: (view.meta?.title as string) || '未命名',
        path: view.path,
        fullPath: view.fullPath,
        name: view.name as string,
        query: view.query,
        affix: (view.meta?.affix as boolean) || false,
        meta: {
          icon: (view.meta?.icon as string) || null,
        },
        seq: this.visitedViews.length + 1,
      }
      if (this.visitedViews.length > 1) {
        this.visitedViews = this.visitedViews.sort((v1, v2) => v1.seq - v2.seq)
      }

      // 检查是否已存在
      const index = this.visitedViews.findIndex(v => v.path === view.path)
      if (index >= 0) {
        const oldSeq = this.visitedViews[index]?.seq || 0
        // 更新现有标签
        this.visitedViews[index] = { ...this.visitedViews[index], ...tagView }
        this.visitedViews[index].seq = oldSeq
        return
      }
      // 添加新标签
      this.visitedViews.push(tagView)

      // 添加到缓存视图(如果需要)
      if (view.meta?.keepAlive && view.name) {
        this.addCachedView(view.name as string)
      }
    },
    // 删除标签
    delView(view: TagView) {
      return new Promise<boolean>(resolve => {
        const index = this.visitedViews.findIndex(v => v.path === view.path)
        if (index >= 0) {
          // 删除标签
          this.visitedViews.splice(index, 1)

          // 删除缓存
          if (view.name) {
            this.delCachedView(view.name)
          }
          resolve(true)
        }
        resolve(false)
      })
    },

    // 删除其他标签
    delOtherViews(view: TagView) {
      this.visitedViews = this.visitedViews.filter(v => v.affix || v.path === view.path)

      // 更新缓存
      this.cachedViews = this.visitedViews.filter(v => v.name).map(v => v.name as string)
    },

    // 删除左侧标签
    delLeftViews(view: TagView) {
      const index = this.visitedViews.findIndex(v => v.path === view.path)
      if (index > 0) {
        this.visitedViews = this.visitedViews.filter((v, i) => v.affix || i >= index)
        this.updateCachedView()
      }
    },

    // 删除右侧标签
    delRightViews(view: TagView) {
      const index = this.visitedViews.findIndex(v => v.path === view.path)
      if (index < this.visitedViews.length - 1) {
        this.visitedViews = this.visitedViews.filter((v, i) => v.affix || i <= index)
        this.updateCachedView()
      }
    },

    // 删除全部标签
    delAllViews() {
      this.visitedViews = this.visitedViews.filter(v => v.affix)
      this.cachedViews = []
    },

    // 添加缓存视图
    addCachedView(name: string) {
      if (this.cachedViews.includes(name)) {
        return
      }
      if (name) {
        this.cachedViews.push(name)
      }
    },

    // 删除缓存视图
    delCachedView(name: string) {
      const index = this.cachedViews.indexOf(name)
      if (index >= 0) {
        this.cachedViews.splice(index, 1)
      }
    },

    // 更新缓存视图
    updateCachedView() {
      this.cachedViews = this.visitedViews
        .filter(v => v.name && !v.affix)
        .map(v => v.name as string)
    },

    // ✅ 刷新视图相关方法
    // 标记页面需要刷新
    markViewForRefresh(path: string) {
      this.refreshFlags[path] = Date.now()
    },

    // 清除刷新标记
    clearRefreshFlag(path: string) {
      delete this.refreshFlags[path]
    },

    // 获取刷新标记
    getRefreshFlag(path: string) {
      return this.refreshFlags[path] || 0
    },
  },
})
