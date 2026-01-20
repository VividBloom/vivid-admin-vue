/**
 * 应用入口：创建并挂载 Vue 应用
 * - 注册 Pinia（状态管理）、路由、ElementPlus 组件库
 * - 全局注册 Element Plus 图标组件
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'virtual:uno.css'
import './styles/main.scss'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 创建根应用实例
const app = createApp(App)

// 全局注册 Element Plus 的所有图标组件，方便模板中直接使用
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 挂载插件：状态管理、路由与 UI 组件库
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 将应用挂载到 index.html 中的 #app 节点
app.mount('#app')
