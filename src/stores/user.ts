/**
 * 用户状态管理（Pinia store）
 * - 负责保存 token、用户信息以及登录/登出等动作
 * - 只将 token 持久化到本地，用户信息在需要时从接口获取
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { LoginParams, UserInfo } from '@/types/user'

import { loginApi, logoutApi, getUserInfoApi } from '@/api/auth'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { storage } from '@/utils/storage'
import { usePermissionStore } from './permission'
import i18n from '@/i18n'

export const useUserStore = defineStore(
  'user',
  () => {
    // 持久化 token（本地存储），页面刷新后仍保留登录态（如果 token 有效）
    const token = ref<string>(storage.get<string>('token') || '')
    // 存储当前用户信息，需注意敏感信息不应长期保留到本地
    const userInfo = ref<UserInfo | null>(null)
    const loginLoading = ref(false)

    // 计算属性（Getters）
    const isLoggedIn = computed(() => !!token.value)
    const userName = computed(() => userInfo.value?.username || '')
    const userId = computed(() => userInfo.value?.id || 0)
    const userRole = computed(() => userInfo.value?.role || '')

    // 登录操作：调用登录接口并保存 token 与用户信息
    const login = async (loginParams: LoginParams): Promise<boolean> => {
      loginLoading.value = true
      try {
        const response = await loginApi(loginParams)
        if (response.code === 200) {
          setToken(response.data.token)
          setUserInfo(response.data.userInfo)
          // 初始化用户权限
          const permissionStore = usePermissionStore()
          await permissionStore.initPermissions()
          ElMessage.success(i18n.global.t('store.loginSuccess'))
          return true
        }
        return false
      } catch (e: any) {
        ElMessage.error(e.message || i18n.global.t('store.loginFailed'))
        return false
      } finally {
        loginLoading.value = false
      }
    }

    // 登出操作：调用后端登出接口并清除本地状态，跳转到登录页
    const logout = async (): Promise<void> => {
      try {
        await logoutApi()
      } catch {
        // 忽略后端登出失败，仍然在客户端清理状态
      } finally {
        // 清除本地状态
        setToken('')
        setUserInfo(null)
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')

        // 清除权限信息
        const permissionStore = usePermissionStore()
        permissionStore.clearPermissions()

        router.push('/login')
        ElMessage.success(i18n.global.t('store.logoutSuccess'))
      }
    }

    // 设置 token 并持久化到 localStorage
    const setToken = (newToken: string) => {
      token.value = newToken
      storage.set('token', newToken)
    }

    // 设置用户信息（只存内存并同时更新 localStorage 的缓存副本）
    const setUserInfo = (newUserInfo: UserInfo | null) => {
      userInfo.value = newUserInfo
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo))
    }

    // 从后端获取用户信息，若 token 无效则抛出错误
    const fetchUserInfo = async () => {
      if (!token.value) {
        throw new Error(i18n.global.t('store.notLoggedIn'))
      }
      try {
        const response = await getUserInfoApi()
        userInfo.value = response.data
      } catch (e: any) {
        // 获取用户信息失败，认为 token 已失效，清理 token
        setToken('')
        storage.remove('token')
        throw e
      }
    }

    // 局部更新用户信息
    const updateUserInfo = (newUserInfo: Partial<UserInfo>): void => {
      if (userInfo.value) {
        userInfo.value = { ...userInfo.value, ...newUserInfo }
      }
    }

    // 检查认证状态：尝试使用 token 获取用户信息
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

    // 清空认证相关信息（供登出或切换用户使用）
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
      pick: ['token'], // 只持久化 token，userInfo 可以实时获取
    },
  }
)
