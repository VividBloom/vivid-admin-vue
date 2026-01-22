import type { MockMethod } from 'vite-plugin-mock'
import { resultSuccess } from './data'

// 通用系统接口
export const commonMocks: MockMethod[] = [
  {
    url: '/api/system/menus',
    method: 'get',
    response: () =>
      resultSuccess([
        {
          id: 1,
          name: 'route.dashboard',
          path: '/dashboard',
          icon: 'Odometer',
        },
        {
          id: 2,
          name: 'route.system',
          path: '/system',
          icon: 'Setting',
          children: [
            { id: 21, name: 'route.userList', path: '/system/user', icon: 'User' },
            { id: 22, name: 'route.roleManagement', path: '/system/role', icon: 'UserFilled' },
            {
              id: 28,
              name: 'route.department',
              path: '/system/department',
              icon: 'OfficeBuilding',
            },
            { id: 29, name: 'route.editorDemo', path: '/system/editor', icon: 'EditPen' },
            { id: 30, name: 'route.fileDemo', path: '/system/file', icon: 'Files' },
            { id: 23, name: 'route.profile', path: '/system/profile', icon: 'User' },
          ],
        },
      ]),
  },
]
