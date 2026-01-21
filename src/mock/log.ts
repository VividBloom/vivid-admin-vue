import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

const logs = Mock.mock({
  'list|50-100': [
    {
      'id|+1': 1,
      username: '@name',
      'module|1': [
        'User Management',
        'Role Management',
        'System Settings',
        'Permission Management',
      ],
      'action|1': ['Login', 'Logout', 'Create', 'Update', 'Delete'],
      ip: '@ip',
      'status|1': ['success', 'fail'],
      createTime: '@datetime',
      details: '@sentence(5, 10)',
    },
  ],
})

export const logMocks: MockMethod[] = [
  {
    url: '/api/log/list',
    method: 'get',
    response: (config: any) => {
      const { page = 1, pageSize = 10, username, module, status } = config.query

      let mockList = logs.list

      if (username) {
        mockList = mockList.filter((item: any) =>
          item.username.toLowerCase().includes(username.toLowerCase())
        )
      }
      if (module) {
        mockList = mockList.filter((item: any) => item.module === module)
      }
      if (status) {
        mockList = mockList.filter((item: any) => item.status === status)
      }

      const p = parseInt(page as string)
      const ps = parseInt(pageSize as string)

      const pageList = mockList.filter(
        (_item: any, index: number) => index < ps * p && index >= ps * (p - 1)
      )

      return {
        code: 200,
        message: 'success',
        data: {
          total: mockList.length,
          list: pageList,
        },
      }
    },
  },
]
