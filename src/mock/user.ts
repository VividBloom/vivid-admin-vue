import type { MockMethod } from 'vite-plugin-mock'
import {
  userList,
  userRoles,
  roles,
  permissions,
  userDirectPermissions,
  resultSuccess,
  resultError,
} from './data'

// 用户管理接口
export const userManagementMocks: MockMethod[] = [
  {
    url: '/api/user/list',
    method: 'get',
    response: () => {
      const result = userList.map(user => {
        const userRoleRelations = userRoles.filter(ur => ur.userId === user.id)
        const userRoleList = roles.filter(r => userRoleRelations.some(ur => ur.roleId === r.id))

        // 获取用户直接权限
        const userDirectPermissionRelations = userDirectPermissions.filter(
          up => up.userId === user.id
        )
        const userDirectPermissionList = permissions.filter(p =>
          userDirectPermissionRelations.some(up => up.permissionId === p.id)
        )

        return {
          ...user,
          roles: userRoleList,
          permissions: userDirectPermissionList,
          password: undefined,
        }
      })
      return resultSuccess(result)
    },
  },
  {
    url: '/api/user/create',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newUser = {
        id: userList.length + 1,
        ...body,
        createTime: new Date().toLocaleString(),
        status: body.status || 'active',
      }
      userList.push(newUser)

      // 处理角色关联
      if (body.roleIds && Array.isArray(body.roleIds)) {
        body.roleIds.forEach((roleId: number) => {
          userRoles.push({ userId: newUser.id, roleId })
        })
      }

      // 处理权限关联
      if (body.permissionIds && Array.isArray(body.permissionIds)) {
        body.permissionIds.forEach((permissionId: number) => {
          userDirectPermissions.push({ userId: newUser.id, permissionId })
        })
      }

      return resultSuccess(newUser)
    },
  },
  {
    url: '/api/user/update/:id',
    method: 'put',
    response: ({ body, params }: { body: any; params: { id: string } }) => {
      const id = parseInt(params.id)
      const index = userList.findIndex(u => u.id === id)
      if (index !== -1) {
        userList[index] = { ...userList[index], ...body }

        // 更新角色关联
        if (body.roleIds && Array.isArray(body.roleIds)) {
          // 先删除旧关联
          const keepRoles = userRoles.filter(ur => ur.userId !== id)
          userRoles.length = 0
          userRoles.push(...keepRoles)
          // 添加新关联
          body.roleIds.forEach((roleId: number) => {
            userRoles.push({ userId: id, roleId })
          })
        }

        // 更新权限关联
        if (body.permissionIds && Array.isArray(body.permissionIds)) {
          // 先删除旧关联
          const keepPermissions = userDirectPermissions.filter(up => up.userId !== id)
          userDirectPermissions.length = 0
          userDirectPermissions.push(...keepPermissions)
          // 添加新关联
          body.permissionIds.forEach((permissionId: number) => {
            userDirectPermissions.push({ userId: id, permissionId })
          })
        }

        return resultSuccess(userList[index])
      }
      return resultError('User not found', 404)
    },
  },
  {
    url: '/api/user/delete/:id',
    method: 'delete',
    response: ({ params }: { params: { id: string } }) => {
      const id = parseInt(params.id)
      const index = userList.findIndex(u => u.id === id)
      if (index !== -1) {
        userList.splice(index, 1)
        // 删除角色关联
        const keepRoles = userRoles.filter(ur => ur.userId !== id)
        userRoles.length = 0
        userRoles.push(...keepRoles)
        // 删除权限关联
        const keepPermissions = userDirectPermissions.filter(up => up.userId !== id)
        userDirectPermissions.length = 0
        userDirectPermissions.push(...keepPermissions)
        return resultSuccess(null, 'Delete successful')
      }
      return resultError('User not found', 404)
    },
  },
  {
    url: '/api/user/batch-create',
    method: 'post',
    response: ({ body }: { body: any[] }) => {
      if (!Array.isArray(body)) {
        return resultError('Invalid data format', 400)
      }

      const newUsers = body.map((item, index) => ({
        id: userList.length + index + 1,
        ...item,
        createTime: new Date().toLocaleString(),
        status: item.status || 'active',
        password: '123456', // Default password
      }))

      userList.push(...newUsers)

      // Default role for imported users (e.g., common user)
      const defaultRole = roles.find(r => r.code === 'user')
      if (defaultRole) {
        newUsers.forEach(u => {
          userRoles.push({ userId: u.id, roleId: defaultRole.id })
        })
      }

      return resultSuccess(newUsers)
    },
  },
]

// 用户角色管理相关接口
export const userRoleMocks: MockMethod[] = [
  {
    url: '/api/user/:userId/roles',
    method: 'get',
    response: ({ params }: { params: { userId: string } }) => {
      const userId = parseInt(params.userId)
      const roleIds = userRoles.filter(ur => ur.userId === userId).map(ur => ur.roleId)
      const userRolesData = roles.filter(r => roleIds.includes(r.id))
      return resultSuccess(userRolesData)
    },
  },
]
