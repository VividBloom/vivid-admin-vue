/**
 * 权限状态管理（Pinia store）
 * - 负责管理用户权限、角色、菜单等RBAC相关状态
 * - 提供权限检查、菜单生成等功能
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { permissionApi, roleApi, userRoleApi } from '@/api'
import { ElMessage } from 'element-plus'
import i18n from '@/i18n'

export const usePermissionStore = defineStore(
  'permission',
  () => {
    // 用户权限信息
    const userPermissions = ref<API.Permission[]>([])
    const userRoles = ref<API.Role[]>([])
    const userMenus = ref<API.PermissionTreeNode[]>([])
    const permissionsLoading = ref(false)

    // 所有权限列表（用于管理页面）
    const allPermissions = ref<API.Permission[]>([])
    const permissionTree = ref<API.PermissionTreeNode[]>([])

    // 所有角色列表
    const allRoles = ref<API.Role[]>([])

    // 计算属性
    const hasPermission = computed(() => {
      return (permissionCode: string): boolean => {
        return userPermissions.value.some(p => p.code === permissionCode)
      }
    })

    const hasAnyPermission = computed(() => {
      return (permissionCodes: string[]): boolean => {
        return permissionCodes.some(code => hasPermission.value(code))
      }
    })

    const hasAllPermissions = computed(() => {
      return (permissionCodes: string[]): boolean => {
        return permissionCodes.every(code => hasPermission.value(code))
      }
    })

    const hasRole = computed(() => {
      return (roleCode: string): boolean => {
        return userRoles.value.some(r => r.code === roleCode)
      }
    })

    // 获取用户权限信息
    const fetchUserPermissions = async (): Promise<void> => {
      permissionsLoading.value = true
      try {
        const response = await permissionApi.getUserPermissions()
        if (response.code === 200) {
          userRoles.value = response.data.roles
          userPermissions.value = response.data.permissions
          userMenus.value = response.data.menus
        }
      } catch (error: any) {
        ElMessage.error(error.message || i18n.global.t('store.fetchPermissionFailed'))
      } finally {
        permissionsLoading.value = false
      }
    }

    // 获取所有权限
    const fetchAllPermissions = async (): Promise<void> => {
      try {
        const response = await permissionApi.getPermissions()
        if (response.code === 200) {
          allPermissions.value = response.data
        }
      } catch (error: any) {
        ElMessage.error(error.message || i18n.global.t('store.fetchPermissionListFailed'))
      }
    }

    // 获取权限树
    const fetchPermissionTree = async (): Promise<void> => {
      try {
        const response = await permissionApi.getPermissionTree()
        if (response.code === 200) {
          permissionTree.value = response.data
        }
      } catch (error: any) {
        ElMessage.error(error.message || i18n.global.t('store.fetchPermissionTreeFailed'))
      }
    }

    // 获取所有角色
    const fetchAllRoles = async (): Promise<void> => {
      try {
        const response = await roleApi.getRoles()
        if (response.code === 200) {
          allRoles.value = response.data
        }
      } catch (error: any) {
        ElMessage.error(error.message || i18n.global.t('store.fetchRoleListFailed'))
      }
    }

    // 获取用户角色
    const fetchUserRoles = async (userId: number): Promise<API.Role[]> => {
      try {
        const response = await userRoleApi.getUserRoles(userId)
        if (response.code === 200) {
          return response.data
        }
        return []
      } catch (error: any) {
        ElMessage.error(error.message || i18n.global.t('store.fetchUserRoleFailed'))
        return []
      }
    }

    // 清除权限信息
    const clearPermissions = (): void => {
      userPermissions.value = []
      userRoles.value = []
      userMenus.value = []
    }

    // 初始化权限数据
    const initPermissions = async (): Promise<void> => {
      await Promise.all([
        fetchUserPermissions(),
        fetchAllPermissions(),
        fetchPermissionTree(),
        fetchAllRoles(),
      ])
    }

    return {
      // 状态
      userPermissions,
      userRoles,
      userMenus,
      permissionsLoading,
      allPermissions,
      permissionTree,
      allRoles,

      // 计算属性
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,

      // 方法
      fetchUserPermissions,
      fetchAllPermissions,
      fetchPermissionTree,
      fetchAllRoles,
      fetchUserRoles,
      clearPermissions,
      initPermissions,
    }
  },
  {
    persist: false, // 权限信息不需要持久化
  }
)
