/**
 * Vite 配置文件
 * - 负责开发服务器、构建输出、插件等项目级配置
 * - 本项目使用 Vue3 + Vite + Pinia + ElementPlus
 */
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import { viteMockServe } from 'vite-plugin-mock'

import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  // 插件配置：按需自动导入、组件解析、Mock、UnoCSS 等
  plugins: [
    // Vue 单文件组件支持
    vue(),
    // 开发时的 Vue devtools 支持（仅在开发环境有用）
    vueDevTools(),
    // 自动导入常用函数（如 ref、computed）并生成类型声明
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
    }),
    // 按需注册组件并生成类型声明（配合 ElementPlusResolver）
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/components.d.ts',
    }),
    // 本地 Mock 服务配置：开发时拦截接口并返回模拟数据
    viteMockServe({
      mockPath: './src/mock', // Mock 文件目录（相对项目根目录）
      logger: true, // 是否在控制台打印 mock 请求日志
    }),
    // 原子化 CSS 引擎（UnoCSS）
    UnoCSS(),
  ],

  // 路径别名配置：使用 '@' 指向 src 目录，便于在项目中导入
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // 开发服务器配置
  server: {
    host: '0.0.0.0', // 对外可访问（例如在局域网调试）
    port: 3000,
    open: true, // 启动时自动打开浏览器
    proxy: {
      // 将以 /api 开头的请求代理到后端服务（方便本地开发跨域）
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
        bypass: (req, res, options) => {
          const proxyUrl = new URL(req.url || '', 'http://localhost')
          if (
            proxyUrl.pathname.startsWith('/api/user') ||
            proxyUrl.pathname.startsWith('/api/role') ||
            proxyUrl.pathname.startsWith('/api/permission')
          ) {
            return req.url
          }
        },
      },
    },
  },

  // 构建相关配置
  build: {
    outDir: 'dist', // 打包输出目录
    assetsDir: 'assets', // 静态资源目录
    sourcemap: true, // 生成 source map 便于定位错误（可在生产环境关闭）
    minify: 'terser', // 使用 terser 进行代码压缩
    rollupOptions: {
      output: {
        // 手动拆分代码块，优化缓存与首屏加载
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          element: ['element-plus'],
        },
      },
    },
  },
})
