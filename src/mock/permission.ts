import type { MockMethod } from 'vite-plugin-mock'
import { permissions, userRoles, roles, resultSuccess, resultError } from './data'

// RBAC 权限管理相关接口
export const permissionMocks: MockMethod[] = [
  {
    url: '/api/permission/list',
    method: 'get',
    response: () => resultSuccess(permissions),
  },
  {
    url: '/api/permission/tree',
    method: 'get',
    response: () => {
      const buildTree = (parentId?: number): API.PermissionTreeNode[] => {
        return permissions
          .filter(p => p.parentId === parentId)
          .map(p => ({
            ...p,
            children: buildTree(p.id),
          }))
      }
      return resultSuccess(buildTree())
    },
  },
  {
    url: '/api/permission/user',
    method: 'get',
    response: (req: any) => {
      const token = req.headers.authorization
      if (!token || !token.includes('mock-jwt-token')) {
        return resultError('Unauthorized', 401)
      }
      const userId = parseInt(token.split('-').pop() || '1')
      const userRoleIds = userRoles.filter(ur => ur.userId === userId).map(ur => ur.roleId)
      const userRolesData = roles.filter(r => userRoleIds.includes(r.id))
      const userPermissions = userRolesData.flatMap(r => r.permissions)

      // 构建菜单树
      const buildMenuTree = (parentId?: number): API.PermissionTreeNode[] => {
        return userPermissions
          .filter(p => p.type === 'menu' && p.parentId === parentId)
          .map(p => ({
            ...p,
            children: buildMenuTree(p.id),
          }))
      }

      const menus = buildMenuTree()

      return resultSuccess({
        roles: userRolesData,
        permissions: userPermissions,
        menus: menus,
      })
    },
  },
]
