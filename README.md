src/
├── api/ # 接口请求
├── assets/ # 静态资源
├── components/ # 通用组件
├── composables/ # 组合式函数
├── layouts/ # 布局组件
├── pages/ # 页面组件
├── router/ # 路由配置
├── stores/ # 状态管理
├── types/ # 类型定义
├── utils/ # 工具函数
└── styles/ # 全局样式
└── main.ts # 入口文件
└── vite.config.ts # Vite 配置文件

# 使用 Vite 创建 Vue3 + TypeScript 项目

```
npm create vue@latest vue3-admin

# 项目配置选项
# ✔ Project name: vue3-admin
# ✔ Add TypeScript? Yes
# ✔ Add JSX Support? No
# ✔ Add Vue Router for Single Page Application development? Yes
# ✔ Add Pinia for state management? Yes
# ✔ Add Vitest for Unit Testing? No (可选)
# ✔ Add an End-to-End Testing Solution? No
# ✔ Add ESLint for code quality? Yes
# ✔ Add Pinia for state management? Yes
# ✔ Add Vitest for Unit Testing? No (可选)
# ✔ Add an End-to-End Testing Solution? No
# ✔ Add ESLint for code quality? Yes
# ✔ Add Prettier for code formatting? Yes

cd vue3-admin
pnpm install
```

# 安装核心依赖

```
# UI 组件库
npm add element-plus

# 自动导入相关
npm add -D unplugin-auto-import unplugin-vue-components

# 开发工具
npm add -D @types/node
npm add -D sass

```

# 核心配置文件

1. vite.config.ts

```
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    // 自动导入 API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
    }),
    // 自动导入组件
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          element: ['element-plus'],
        },
      },
    },
  },
})
```

2. tsconfig.json

```
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client", "element-plus/global"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

3. eslint.config.js​

```
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import prettier from 'eslint-config-prettier'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  // 1. 全局忽略配置
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.d.ts',
      'eslint.config.*', // 避免检查自身
    ],
  },
  // 2. 应用 ESLint 推荐规则
  js.configs.recommended,
  // 3. 应用 TypeScript 推荐规则
  ...tseslint.configs.recommended,
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),
  // 4. 应用 Vue.js 推荐规则
  ...pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  skipFormatting,
  // 5. 通用文件配置（适用于 JS/TS/Vue）
  {
    files: ['**/*.{js,ts,mts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest' as const,
      sourceType: 'module' as const,
      globals: {
        ...globals.browser, // 浏览器环境全局变量
        ...globals.node, // Node.js 环境全局变量
      },
    },
    rules: {
      // 通用规则调整
      'prefer-const': 'error',
      'no-var': 'error',
      '@typescript-eslint/ban-ts-ignore': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'prettier/prettier': 'error',
      // 禁止出现console
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      // 禁用debugger
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      // 禁止出现重复的 case 标签
      'no-duplicate-case': 'warn',
      // 禁止出现空语句块
      'no-empty': 'warn',
      // 禁止不必要的括号
      'no-extra-parens': 'off',
      // 禁止对 function 声明重新赋值
      'no-func-assign': 'warn',
      // 禁止在 return、throw、continue 和 break 语句之后出现不可达代码
      'no-unreachable': 'warn',
      // 强制所有控制语句使用一致的括号风格
      curly: 'warn',
      // 要求 switch 语句中有 default 分支
      'default-case': 'warn',
      // 强制尽可能地使用点号
      'dot-notation': 'warn',
      // 要求使用 === 和 !==
      eqeqeq: 'warn',
      // 禁止 if 语句中 return 语句之后有 else 块
      'no-else-return': 'warn',
      // 禁止出现空函数
      'no-empty-function': 'warn',
      // 禁用不必要的嵌套块
      'no-lone-blocks': 'warn',
      // 禁止使用多个空格
      'no-multi-spaces': 'warn',
      // 禁止多次声明同一变量
      'no-redeclare': 'warn',
      // 禁止在 return 语句中使用赋值语句
      'no-return-assign': 'warn',
      // 禁用不必要的 return await
      'no-return-await': 'warn',
      // 禁止自我赋值
      'no-self-assign': 'warn',
      // 禁止自身比较
      'no-self-compare': 'warn',
      // 禁止不必要的 catch 子句
      'no-useless-catch': 'warn',
      // 禁止多余的 return 语句
      'no-useless-return': 'warn',
      // 禁止变量声明与外层作用域的变量同名
      'no-shadow': 'off',
      // 允许delete变量
      'no-delete-var': 'off',
      // 强制数组方括号中使用一致的空格
      'array-bracket-spacing': 'warn',
      // 强制在代码块中使用一致的大括号风格
      'brace-style': 'warn',
      // 强制使用骆驼拼写法命名约定
      camelcase: 'warn',
      // 强制使用一致的缩进
      indent: 'off',
      // 强制在 JSX 属性中一致地使用双引号或单引号
      // 'jsx-quotes': 'warn',
      // 强制可嵌套的块的最大深度4
      'max-depth': 'warn',
      // 强制最大行数 300
      // "max-lines": ["warn", { "max": 1200 }],
      // 强制函数最大代码行数 50
      // 'max-lines-per-function': ['warn', { max: 70 }],
      // 强制函数块最多允许的的语句数量20
      'max-statements': ['warn', 100],
      // 强制回调函数最大嵌套深度
      'max-nested-callbacks': ['warn', 3],
      // 强制函数定义中最多允许的参数数量
      'max-params': ['warn', 3],
      // 强制每一行中所允许的最大语句数量
      'max-statements-per-line': ['warn', { max: 1 }],
      // 要求方法链中每个调用都有一个换行符
      'newline-per-chained-call': ['warn', { ignoreChainWithDepth: 3 }],
      // 禁止 if 作为唯一的语句出现在 else 语句中
      'no-lonely-if': 'warn',
      // 禁止空格和 tab 的混合缩进
      'no-mixed-spaces-and-tabs': 'warn',
      // 禁止出现多行空行
      'no-multiple-empty-lines': 'warn',
      // 禁止出现;
      semi: ['warn', 'never'],
      // 强制在块之前使用一致的空格
      'space-before-blocks': 'warn',
      // 强制在 function的左括号之前使用一致的空格
      // 'space-before-function-paren': ['warn', 'never'],
      // 强制在圆括号内使用一致的空格
      'space-in-parens': 'warn',
      // 要求操作符周围有空格
      'space-infix-ops': 'warn',
      // 强制在一元操作符前后使用一致的空格
      'space-unary-ops': 'warn',
      // 强制在注释中 // 或 /* 使用一致的空格
      // "spaced-comment": "warn",
      // 强制在 switch 的冒号左右有空格
      'switch-colon-spacing': 'warn',
      // 强制箭头函数的箭头前后使用一致的空格
      'arrow-spacing': 'warn',
      'prefer-rest-params': 'warn',
      'no-useless-escape': 'warn',
      'no-irregular-whitespace': 'warn',
      'no-prototype-builtins': 'warn',
      'no-fallthrough': 'warn',
      'no-extra-boolean-cast': 'warn',
      'no-case-declarations': 'warn',
      'no-async-promise-executor': 'warn',
    },
  },
  // 6. Vue 文件特定配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser, // 使用 TypeScript 解析器解析 Vue 文件中的 <script> 部分
        ecmaVersion: 'latest' as const,
        sourceType: 'module' as const,
      },
    },
    rules: {
      // Vue 特定规则调整
      'vue/multi-word-component-names': 'off', // 允许单单词组件名
      'vue/no-v-html': 'warn', // 谨慎使用 v-html
      'vue/require-default-prop': 'off', // 不要求必须提供默认 prop
    },
  },

  // 7. TypeScript 文件特定配置
  {
    files: ['**/*.ts'],
    rules: {
      // TypeScript 规则调整
      '@typescript-eslint/no-explicit-any': 'off', // 根据项目需要决定是否开启
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },

  // Prettier 集成配置（注意顺序，这个配置应放在最后以覆盖可能冲突的格式规则）
  {
    plugins: {
      prettier: require('eslint-plugin-prettier'),
    },
    rules: {
      ...prettier.rules,
      'prettier/prettier': 'warn', // 将 Prettier 的格式化问题报告为警告
    },
  },
)

```

4. .prettierrc.json

```

{
"semi": false,
"singleQuote": true,
"printWidth": 100,
"tabWidth": 2,
"trailingComma": "es5",
"bracketSpacing": true,
"arrowParens": "avoid",
"endOfLine": "auto"
}

```

# 集成Git Hooks, husky + lint-staged, 代码提交规范

Commitizen 及其适配器（可选，用于规范提交信息）
Commitlint（可选，用于校验提交信息）

```
npm add -D husky lint-staged commitizen cz-conventional-changelog @commitlint/cli @commitlint/config-conventional

# 初始化 Husky，这会在项目根目录创建 .husky 文件夹
npx husky-init

# 安装 Husky 的 Git 钩子
npm exec husky install

#  配置 lint-staged, 在 package.json中添加 lint-staged字段
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{json,md,css,scss}": [
      "prettier --write"
    ]
  }
}

# 修改 pre-commit 钩子, 将 .husky/pre-commit文件的内容修改为执行 lint-staged
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged

# 配置提交信息规范, 在 package.json中添加配置，指定使用常规提交规范, 之后可以使用 pnpm commit或 npx cz来代替 git commit，通过交互式提示生成规范的提交信息
{
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  },
  "scripts": {
    "commit": "cz"
  }
}

# 配置 Commitlint：在项目根目录创建 commitlint.config.js文件，定义校验规则
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',    // 新功能
        'fix',     // 修复Bug
        'docs',    // 文档更新
        'style',   // 代码格式调整
        'refactor',// 代码重构
        'perf',    // 性能优化
        'test',    // 测试相关
        'chore',   // 构建过程或辅助工具变动
      ]
    ]
  }
};

# 使用 Husky 添加 commit-msg钩子来触发 Commitlint 检查
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
```

# 工作流程

进行代码修改。
使用 git add .或 git add <file>将修改加入暂存区。
执行 git commit -m "..."（或 pnpm commit）。
自动触发：Husky 的 pre-commit钩子会执行 lint-staged，后者仅对暂存区的文件运行 ESLint 修复和 Prettier 格式化。如果所有检查通过，提交才会成功；否则，你需要根据错误提示修复后重新提交。
（如果配置了）Husky 的 commit-msg钩子会使用 Commitlint 校验你的提交信息格式，不符合规范则拒绝提交。
Prettier 格式化。如果所有检查通过，提交才会成功；否则，你需要根据错误提示修复后重新提交。
（如果配置了）Husky 的 commit-msg钩子会使用 Commitlint 校验你的提交信息格式，不符合规范则拒绝提交。

# 刷新流程示例

1. 用户右键点击标签页 → 选择"刷新"
2. 调用 tagsViewStore.markViewForRefresh(currentPath)
3. AppMain.vue 通过 getRefreshFlag 检测到变化
4. 组件 key 改变 → Vue 重新渲染组件
5. 组件内部通过 watch 检测刷新标记 → 重新加载数据
6. 刷新完成后，延迟调用 clearRefreshFlag

# 集成 Tailwind CSS

```
# 安装 Tailwind CSS v4
pnpm add -D tailwindcss@next
pnpm add -D @tailwindcss/vite

# 安装必要的插件
pnpm add -D @tailwindcss/forms
pnpm add lucide-vue-next # 现代化图标库


// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(), // 添加 Tailwind CSS v4
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use '@/styles/main.scss' as *;';`,
      },
    },
  },
})

# 创建 Tailwind CSS 配置
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色调 - 紫色
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // 中性色
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideIn: {
          '0%': { transform: 'translateX(20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

toolName: view_folder

status: success

/Users/blues/workspaces/sites/vue-admin/src

toolName: view_files

status: success

filePath: /Users/blues/workspaces/sites/vue-admin/package.json

已经为您梳理了一个通用的 电子文档阅读器功能清单 ，涵盖了从基础体验到高级交互的各个维度。

由于您当前使用的是 @vue-office/docx , @vue-office/pdf 和自建的 EpubViewer ，部分功能的实现难度和可行性会有所不同。请您查阅下表，并告诉我您希望 优先实现 哪些功能模块：

### 📚 电子文档阅读器功能清单 1. 基础阅读体验 (核心)

这些是阅读器的基本功，建议优先完善。

- 多格式支持 : 现已支持 PDF, Word, Excel, PPT, Epub, XMind。
- 目录/大纲 (TOC) :
  - Epub : 已实现。
  - Word/PDF : 点击侧边栏目录跳转到对应章节（ @vue-office 对此支持有限，可能需要额外扩展或更换库）。
- 缩放控制 : 放大、缩小、自适应宽度、自适应屏幕。
- 全屏模式 : 沉浸式阅读，隐藏浏览器和其他 UI 元素。
- 加载状态与错误处理 : 优雅的 Loading 动画和加载失败提示（现有基础实现，可优化）。

2. 个性化设置: 提升用户阅读舒适度。

- 主题切换 : 亮色、暗色、护眼模式（Epub 已实现，Word/PDF 目前通常是白底黑字，实现暗色模式通常需要 CSS 滤镜 filter: invert() 这种“伪”夜间模式）。
- 字体设置 : 调整字号大小（Epub 已实现，Word/PDF 调整字号会导致排版错乱，通常只支持缩放）。
- 阅读布局 : 单页模式 vs 双页模式（对宽屏显示器友好）。 3. 交互与工具
  增强其实用性。

- 全文搜索 : 搜索关键词，高亮显示匹配项，并支持“上一个/下一个”跳转。
- 页面跳转 : 输入页码直接跳转（PDF/Word 常用）。
- 缩略图预览 : (主要针对 PDF) 左侧显示页面缩略图，快速定位。
- 记忆功能 : 自动记录并恢复上次阅读的进度/页码（Epub 已实现）。 4. 标注与笔记 (高级)
  这部分开发成本较高，通常用于学习型阅读器。

- 高亮/划线 : 选中文本进行颜色高亮、下划线、删除线。
- 批注/笔记 : 对选中文本添加文字备注，并支持在侧边栏查看所有笔记。
- 书签 : 标记特定页面。 5. 安全与导出
- 水印防护 : 叠加用户名/时间戳水印（项目中已有 useWatermark ）。
- 打印/下载控制 : 配置是否允许用户打印或下载源文件。
- 防复制 : 禁止右键和文本选择。
