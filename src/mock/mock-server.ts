// src/mock/mock-server.ts
import type { MockMethod } from 'vite-plugin-mock'

// 1. 模拟数据定义
const userList = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createTime: '2025-01-01 10:00:00',
    status: 'active',
  },
  {
    id: 2,
    username: 'user1',
    password: '123456',
    email: 'user1@example.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    createTime: '2025-01-02 14:30:00',
    status: 'active',
  },
]

const dashboardData = {
  totalUsers: 12480,
  totalOrders: 8924,
  totalRevenue: 256890,
  avgConversion: 68.5,
  weeklyVisits: [820, 932, 901, 934, 1290, 1330, 1320],
  userDistribution: [
    { value: 1048, name: '移动端' },
    { value: 735, name: 'PC端' },
    { value: 580, name: '平板端' },
    { value: 300, name: '其他' },
  ],
}

// RBAC 权限数据
const permissions: API.Permission[] = [
  // 系统管理
  {
    id: 1,
    name: '系统管理',
    code: 'system',
    type: 'menu',
    path: '/system',
    icon: 'Setting',
    sort: 1,
    status: 'active',
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  {
    id: 2,
    name: '用户管理',
    code: 'system:user',
    type: 'menu',
    parentId: 1,
    path: '/system/user',
    icon: 'User',
    sort: 1,
    status: 'active',
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  {
    id: 3,
    name: '角色管理',
    code: 'system:role',
    type: 'menu',
    parentId: 1,
    path: '/system/role',
    icon: 'UserCheck',
    sort: 2,
    status: 'active',
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  {
    id: 4,
    name: '权限管理',
    code: 'system:permission',
    type: 'menu',
    parentId: 1,
    path: '/system/permission',
    icon: 'Shield',
    sort: 3,
    status: 'active',
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  // 仪表盘
  {
    id: 5,
    name: '仪表盘',
    code: 'dashboard',
    type: 'menu',
    path: '/dashboard',
    icon: 'Odometer',
    sort: 0,
    status: 'active',
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  // 用户相关权限
  {
    id: 6,
    name: '用户查看',
    code: 'user:view',
    type: 'button',
    parentId: 2,
    sort: 1,
    status: 'active',
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  {
    id: 7,
    name: '用户创建',
    code: 'user:create',
    type: 'button',
    parentId: 2,
    sort: 2,
    status: 'active',
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  {
    id: 8,
    name: '用户编辑',
    code: 'user:edit',
    type: 'button',
    parentId: 2,
    sort: 3,
    status: 'active',
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  {
    id: 9,
    name: '用户删除',
    code: 'user:delete',
    type: 'button',
    parentId: 2,
    sort: 4,
    status: 'active',
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
]

// 角色数据
const roles: API.Role[] = [
  {
    id: 1,
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有系统所有权限',
    status: 'active',
    permissions: permissions,
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  {
    id: 2,
    name: '管理员',
    code: 'admin',
    description: '拥有大部分管理权限',
    status: 'active',
    permissions: permissions.filter(p => p.id !== 9), // 排除用户删除权限
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  {
    id: 3,
    name: '普通用户',
    code: 'user',
    description: '基本用户权限',
    status: 'active',
    permissions: permissions.filter(p => p.id === 5 || p.id === 6), // 只有仪表盘查看和用户查看权限
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
]

// 用户角色关系
const userRoles: API.UserRole[] = [
  { userId: 1, roleId: 1 }, // admin用户是超级管理员
  { userId: 2, roleId: 3 }, // user1是普通用户
]

// 用户直接权限关系
const userDirectPermissions: { userId: number; permissionId: number }[] = []

// 2. 工具函数：封装统一响应格式 [5,11](@ref)
export const resultSuccess = <T = any>(data: T, message = '操作成功') => ({
  code: 200,
  data,
  message,
  success: true,
})

export const resultError = (message = '请求失败', code = 500) => ({
  code,
  message,
  success: false,
})

// 3. 用户相关接口 [6,10](@ref)
export const userMocks: MockMethod[] = [
  {
    url: '/api/auth/login',
    method: 'post',
    timeout: 500,
    response: ({ body }: { body: any }) => {
      const { username, password } = body
      const user = userList.find(u => u.username === username && u.password === password)

      if (user) {
        return resultSuccess(
          {
            token: 'mock-jwt-token-' + user.id,
            userInfo: { ...user, password: undefined },
          },
          '登录成功'
        )
      }
      return resultError('用户名或密码错误', 401)
    },
  },
  {
    url: '/api/auth/userinfo',
    method: 'get',
    timeout: 300,
    response: (req: any) => {
      const token = req.headers.authorization
      if (!token || !token.includes('mock-jwt-token')) {
        return resultError('未授权', 401)
      }
      // 简单根据token查找用户
      const userId = parseInt(token.split('-').pop() || '1')
      const user = userList.find(u => u.id === userId)
      if (user) {
        return resultSuccess({ ...user, password: undefined })
      }
      return resultError('用户不存在', 404)
    },
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => resultSuccess(null, '退出成功'),
  },
]

// 4. 仪表盘数据接口 [1,3](@ref)
export const dashboardMocks: MockMethod[] = [
  {
    url: '/api/dashboard/data',
    method: 'get',
    timeout: 400,
    response: () => resultSuccess(dashboardData),
  },
  {
    url: '/api/transactions/realtime',
    method: 'get',
    response: () =>
      resultSuccess([
        {
          id: 'ORD001',
          user: '用户A',
          amount: 299,
          status: 'success',
          time: '2025-01-17 10:30:00',
        },
        {
          id: 'ORD002',
          user: '用户B',
          amount: 159,
          status: 'pending',
          time: '2025-01-17 10:25:00',
        },
        {
          id: 'ORD003',
          user: '用户C',
          amount: 899,
          status: 'success',
          time: '2025-01-17 10:20:00',
        },
      ]),
  },
]

// 5. 通用系统接口
export const commonMocks: MockMethod[] = [
  {
    url: '/api/system/menus',
    method: 'get',
    response: () =>
      resultSuccess([
        {
          id: 1,
          name: '仪表盘',
          path: '/dashboard',
          icon: 'Odometer',
        },
        {
          id: 2,
          name: '系统管理',
          path: '/system',
          icon: 'Setting',
          children: [
            { id: 21, name: '用户管理', path: '/system/user', icon: 'User' },
            { id: 22, name: '角色管理', path: '/system/role', icon: 'UserFilled' },
            { id: 23, name: '个人资料', path: '/system/profile', icon: 'User' },
          ],
        },
      ]),
  },
]

// 6. 用户管理接口
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
      return resultError('用户不存在', 404)
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
        return resultSuccess(null, '删除成功')
      }
      return resultError('用户不存在', 404)
    },
  },
]

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
        return resultError('未授权', 401)
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

// 角色管理相关接口
export const roleMocks: MockMethod[] = [
  {
    url: '/api/role/list',
    method: 'get',
    response: () => resultSuccess(roles),
  },
  {
    url: '/api/role/detail/:id',
    method: 'get',
    response: ({ params }: { params: { id: string } }) => {
      const role = roles.find(r => r.id === parseInt(params.id))
      if (role) {
        return resultSuccess(role)
      }
      return resultError('角色不存在', 404)
    },
  },
  {
    url: '/api/role/:id/permissions',
    method: 'get',
    response: ({ params }: { params: { id: string } }) => {
      const role = roles.find(r => r.id === parseInt(params.id))
      if (role) {
        return resultSuccess(role.permissions)
      }
      return resultError('角色不存在', 404)
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
