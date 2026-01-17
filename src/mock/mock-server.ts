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
    response: ({ body }) => {
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
    response: req => {
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
