import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { LoginParams, UserInfo, LoginResponse } from '@/types/user'

import { loginApi, logoutApi, getUserInfoApi } from '@/api/auth'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>(localStorage.getItem('token') || '')
    const userInfo = ref<UserInfo | null>(null)
    const loginLoading = ref(false)

    // 计算属性
    const isLoggedIn = computed(() => !!token.value)
    const userName = computed(() => userInfo.value?.username || '')
    const userId = computed(() => userInfo.value?.id || 0)
    const userRole = computed(() => userInfo.value?.role || '')

    const login = async (loginParams: LoginParams): Promise<boolean> => {
      loginLoading.value = true
      try {
        const response = await loginApi(loginParams)
        if (response.code === 200) {
          setToken(response.data.token)
        }
        setUserInfo(response.data.userInfo)
        ElMessage.success('登录成功')
        return true
      } catch (e: any) {
        ElMessage.error(e.message || '登录失败')
        return false
      } finally {
        loginLoading.value = false
      }
    }

    const logout = async (): Promise<void> => {
      try {
        await logoutApi()
      } catch (e: any) {
        console.warn('退出接口调用失败', e)
      } finally {
        // 清除本地状态
        setToken('')
        localStorage.removeItem('token')

        router.push('/login')
        ElMessage.success('已退出登录')
      }
    }

    const setToken = (newToken: string) => {
      token.value = newToken
      localStorage.setItem('token', newToken)
    }

    const setUserInfo = (newUserInfo: UserInfo | null) => {
      userInfo.value = newUserInfo
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo))
    }

    const fetchUserInfo = async () => {
      if (!token.value) {
        throw new Error('未登录')
      }
      try {
        const response = await getUserInfoApi()
        userInfo.value = response.data
      } catch (e: any) {
        setToken('')
        localStorage.removeItem('token')
        throw e
      }
    }

    const updateUserInfo = (newUserInfo: Partial<UserInfo>): void => {
      if (userInfo.value) {
        userInfo.value = { ...userInfo.value, ...newUserInfo }
      }
    }

    const checkAuthStatus = async (): Promise<boolean> => {
      if (!token.value) {
        return false
      }
      try {
        await fetchUserInfo()
        return true
      } catch (e: any) {
        console.warn('自动登录失败: ', e)
        logout()
        return false
      }
    }

    const clearAuth = (): void => {
      setToken('')
      setUserInfo(null)
      localStorage.removeItem('token')
    }

    return {
      // States
      token,
      userInfo,
      loginLoading,

      // Getters
      isLoggedIn,
      userName,
      userId,
      userRole,

      // Actions
      login,
      logout,
      fetchUserInfo,
      updateUserInfo,
      setUserInfo,
      checkAuthStatus,
      clearAuth,
    }
  },
  {
    // 数据持久化配置（可选，需要安装 pinia-plugin-persistedstate）
    persist: {
      key: 'user-store',
      paths: ['token'], // 只持久化 token，userInfo 可以实时获取
    },
  }
)
