/**
 * 标签页（TagsView）状态管理
 * - 记录已访问的路由标签、缓存路由名以及刷新标记
 * - 支持添加/删除/保留固定标签（affix）等常见操作
 */
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
    // 当前激活的标签（基于浏览器路径匹配）
    activeView: state => {
      return state.visitedViews.find(view => view.path === window.location.pathname)
    },
  },

  actions: {
    // 添加标签（仅对设置了 keepAlive 的路由生效）
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

      // 检查是否已存在，存在则更新（保留原序号）
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

      // 如果需要缓存该页面组件，则将其 name 加入缓存列表
      if (view.meta?.keepAlive && view.name) {
        this.addCachedView(view.name as string)
      }
    },
    // 删除标签，返回 Promise 以便在外部等待动画或路由切换
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

    // 删除除当前标签外的所有非 affix 标签
    delOtherViews(view: TagView) {
      this.visitedViews = this.visitedViews.filter(v => v.affix || v.path === view.path)

      // 更新缓存
      this.cachedViews = this.visitedViews.filter(v => v.name).map(v => v.name as string)
    },

    // 删除左侧标签（保留 affix 和当前及其右侧）
    delLeftViews(view: TagView) {
      const index = this.visitedViews.findIndex(v => v.path === view.path)
      if (index > 0) {
        this.visitedViews = this.visitedViews.filter((v, i) => v.affix || i >= index)
        this.updateCachedView()
      }
    },

    // 删除右侧标签（保留 affix 和当前及其左侧）
    delRightViews(view: TagView) {
      const index = this.visitedViews.findIndex(v => v.path === view.path)
      if (index < this.visitedViews.length - 1) {
        this.visitedViews = this.visitedViews.filter((v, i) => v.affix || i <= index)
        this.updateCachedView()
      }
    },

    // 删除全部非 affix 标签
    delAllViews() {
      this.visitedViews = this.visitedViews.filter(v => v.affix)
      this.cachedViews = []
    },

    // 添加缓存视图（组件名）
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

    // 更新缓存视图为当前 visitedViews 中非 affix 的页面名
    updateCachedView() {
      this.cachedViews = this.visitedViews
        .filter(v => v.name && !v.affix)
        .map(v => v.name as string)
    },

    // ✅ 刷新视图相关方法
    // 标记页面需要刷新（通过时间戳作为标记）
    markViewForRefresh(path: string) {
      this.refreshFlags[path] = Date.now()
    },

    // 清除刷新标记
    clearRefreshFlag(path: string) {
      delete this.refreshFlags[path]
    },

    // 获取刷新标记（返回时间戳或 0）
    getRefreshFlag(path: string) {
      return this.refreshFlags[path] || 0
    },
  },
})
