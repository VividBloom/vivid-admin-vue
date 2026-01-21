/**
 * 权限指令
 * 用于控制元素显示/隐藏基于用户权限
 */
import { usePermissionStore } from '@/stores/permission'

export const permissionDirective = {
  mounted(el: HTMLElement, binding: any) {
    const permissionStore = usePermissionStore()
    const { value } = binding

    if (value && typeof value === 'string') {
      // 单个权限检查
      if (!permissionStore.hasPermission(value)) {
        el.style.display = 'none'
      }
    } else if (value && Array.isArray(value)) {
      // 多个权限检查
      const [permissions, logic = 'or'] = value
      let hasAccess = false

      if (logic === 'and') {
        hasAccess = permissionStore.hasAllPermissions(permissions)
      } else {
        hasAccess = permissionStore.hasAnyPermission(permissions)
      }

      if (!hasAccess) {
        el.style.display = 'none'
      }
    }
  },
}
