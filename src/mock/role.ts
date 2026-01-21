import type { MockMethod } from 'vite-plugin-mock'
import { roles, resultSuccess, resultError } from './data'

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
      return resultError('Role not found', 404)
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
      return resultError('Role not found', 404)
    },
  },
]
