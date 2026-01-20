<!--
  登录页面 Login
  - 包含登录表单、第三方登录按钮及右侧装饰插图
  - 使用 `useUserStore` 执行登录操作，并通过 `useAppStore` 切换主题
  - 表单提交后示例性地跳转到首页（实际应等待登录接口响应）
-->
<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300"
  >
    <!-- Theme Toggle -->
    <div class="absolute top-4 right-4 z-50">
      <button
        class="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-300"
        @click="toggleDark()"
      >
        <div v-if="isDark" class="i-mdi-weather-night text-xl" />
        <div v-else class="i-mdi-weather-sunny text-xl" />
      </button>
    </div>

    <div
      class="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row animate-fade-in transition-colors duration-300"
    >
      <!-- Left Side - Form -->
      <div class="w-full md:w-1/2 p-8 md:p-12">
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">Welcome Back</h2>
          <p class="text-gray-500 dark:text-gray-400">Please enter your details to sign in</p>
        </div>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <div class="space-y-2">
            <label for="username" class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >Username</label
            >
            <input
              id="username"
              v-model="username"
              type="text"
              name="username"
              placeholder="Enter your username"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >Password</label
            >
            <input
              id="password"
              v-model="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700"
              />
              <label
                for="remember-me"
                class="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Remember me
              </label>
            </div>
            <a
              href="#"
              class="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300"
          >
            Sign in
          </button>

          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                >Or continue with</span
              >
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <button
              type="button"
              class="flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-colors duration-300"
            >
              <div class="i-logos-google-icon text-lg" />
              <span>Google</span>
            </button>
            <button
              type="button"
              class="flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-colors duration-300"
            >
              <div class="i-mdi-github text-xl dark:text-white" />
              <span>GitHub</span>
            </button>
          </div>
        </form>

        <p class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?
          <a
            href="#"
            class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>

      <!-- Right Side - Illustration -->
      <div
        class="hidden md:flex md:w-1/2 bg-primary-50 dark:bg-gray-900 items-center justify-center p-12 relative overflow-hidden transition-colors duration-300"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-primary-100/50 to-primary-50/50 dark:from-gray-800/50 dark:to-gray-900/50"
        ></div>
        <div class="relative z-10 w-full max-w-md animate-float">
          <LoginIllustration />
        </div>
        <!-- Decorative circles -->
        <div
          class="absolute top-10 right-10 w-20 h-20 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
        ></div>
        <div
          class="absolute bottom-10 left-10 w-20 h-20 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useAppStore } from '../stores/app'
import { storeToRefs } from 'pinia'
import LoginIllustration from '../components/LoginIllustration.vue'
import type { LoginParams } from '@/types/user'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// 响应式主题状态（来自 app store）
const { isDark } = storeToRefs(appStore)
const { toggleDark } = appStore

// 表单字段
const username = ref('')
const password = ref('')

// 提交登录：示例逻辑，实际应等待 login 返回结果再跳转并处理失败情况
const handleLogin = async () => {
  if (username.value && password.value) {
    await userStore.login({ username: username.value, password: password.value } as LoginParams)
    // 登录后跳转到首页（在真实项目中应根据后端结果和权限进行路由处理）
    router.push('/')
  }
}
</script>
