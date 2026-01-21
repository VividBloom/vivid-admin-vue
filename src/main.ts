/**
 * 应用入口：创建并挂载 Vue 应用
 * - 注册 Pinia（状态管理）、路由、ElementPlus 组件库
 * - 全局注册 Element Plus 图标组件
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'virtual:uno.css'
import './styles/main.scss'

import { permissionDirective } from '@/directives/permission'
import i18n from './i18n'

// 创建根应用实例
const app = createApp(App)

// 创建Pinia实例并配置持久化插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 注册权限指令
app.directive('permission', permissionDirective)

// 挂载插件：状态管理、路由与 UI 组件库
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(i18n)

// 将应用挂载到 index.html 中的 #app 节点
app.mount('#app')
