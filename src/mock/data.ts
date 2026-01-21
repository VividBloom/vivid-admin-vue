// src/mock/data.ts

// 1. 模拟数据定义
export const userList = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createTime: '2025-01-01 10:00:00',
    status: 'active',
    deptId: 1, // HQ
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
    deptId: 4, // Frontend Group
  },
]

export const dashboardData = {
  totalUsers: 12480,
  totalOrders: 8924,
  totalRevenue: 256890,
  avgConversion: 68.5,
  weeklyVisits: [820, 932, 901, 934, 1290, 1330, 1320],
  userDistribution: [
    { value: 1048, name: 'Mobile' },
    { value: 735, name: 'PC' },
    { value: 580, name: 'Tablet' },
    { value: 300, name: 'Other' },
  ],
}

// RBAC 权限数据
export const permissions: API.Permission[] = [
  // 系统管理
  {
    id: 1,
    name: 'route.system',
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
    name: 'route.userList',
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
    name: 'route.roleManagement',
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
    name: 'route.permissionManagement',
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
  {
    id: 10,
    name: 'route.department',
    code: 'system:dept',
    type: 'menu',
    parentId: 1,
    path: '/system/department',
    icon: 'OfficeBuilding',
    sort: 4,
    status: 'active',
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  {
    id: 11,
    name: 'route.dict',
    code: 'system:dict',
    type: 'menu',
    parentId: 1,
    path: '/system/dict',
    icon: 'Collection',
    sort: 5,
    status: 'active',
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  {
    id: 12,
    name: 'route.auditLog',
    code: 'system:log',
    type: 'menu',
    parentId: 1,
    path: '/system/log',
    icon: 'Document',
    sort: 6,
    status: 'active',
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  {
    id: 13,
    name: 'route.editorDemo',
    code: 'system:editor',
    type: 'menu',
    parentId: 1,
    path: '/system/editor',
    icon: 'EditPen',
    sort: 7,
    status: 'active',
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  // 仪表盘
  {
    id: 5,
    name: 'route.dashboard',
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
    name: 'User View',
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
    name: 'User Create',
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
    name: 'User Edit',
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
    name: 'User Delete',
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
export const roles: API.Role[] = [
  {
    id: 1,
    name: 'Super Admin',
    code: 'super_admin',
    description: 'Has all system permissions',
    status: 'active',
    permissions: permissions,
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  {
    id: 2,
    name: 'Admin',
    code: 'admin',
    description: 'Has most management permissions',
    status: 'active',
    permissions: permissions.filter(p => p.id !== 9), // 排除用户删除权限
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
  {
    id: 3,
    name: 'User',
    code: 'user',
    description: 'Basic user permissions',
    status: 'active',
    permissions: permissions.filter(p => p.id === 5 || p.id === 6), // 只有仪表盘查看和用户查看权限
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-01-01 00:00:00',
  },
]

// 用户角色关系
export const userRoles: API.UserRole[] = [
  { userId: 1, roleId: 1 }, // admin用户是超级管理员
  { userId: 2, roleId: 3 }, // user1是普通用户
]

// 用户直接权限关系
export const userDirectPermissions: { userId: number; permissionId: number }[] = []

// 2. 工具函数：封装统一响应格式
export const resultSuccess = <T = any>(data: T, message = 'Operation successful') => ({
  code: 200,
  data,
  message,
  success: true,
})

export const resultError = (message = 'Request failed', code = 500) => ({
  code,
  message,
  success: false,
})
