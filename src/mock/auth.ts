import type { MockMethod } from 'vite-plugin-mock'
import { userList, resultSuccess, resultError } from './data'

// 用户相关接口 (Auth)
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
          'Login successful'
        )
      }
      return resultError('Username or password incorrect', 401)
    },
  },
  {
    url: '/api/auth/userinfo',
    method: 'get',
    timeout: 300,
    response: (req: any) => {
      const token = req.headers.authorization
      if (!token || !token.includes('mock-jwt-token')) {
        return resultError('Unauthorized', 401)
      }
      // 简单根据token查找用户
      const userId = parseInt(token.split('-').pop() || '1')
      const user = userList.find(u => u.id === userId)
      if (user) {
        return resultSuccess({ ...user, password: undefined })
      }
      return resultError('User not found', 404)
    },
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => resultSuccess(null, 'Logout successful'),
  },
]
