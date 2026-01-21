import type { AxiosRequestConfig } from 'axios'
import 'mockjs'

const departmentList = [
  {
    id: 1,
    parentId: null,
    name: 'Headquarters',
    code: 'HQ',
    sort: 1,
    status: 'active',
    leader: 'CEO',
    phone: '010-12345678',
    email: 'ceo@example.com',
    createTime: '2024-01-01 09:00:00',
    children: [
      {
        id: 2,
        parentId: 1,
        name: 'R&D Department',
        code: 'RD',
        sort: 1,
        status: 'active',
        leader: 'CTO',
        phone: '010-87654321',
        email: 'rd@example.com',
        createTime: '2024-01-01 09:00:00',
        children: [
          {
            id: 4,
            parentId: 2,
            name: 'Frontend Group',
            code: 'FE',
            sort: 1,
            status: 'active',
            leader: 'Frontend Lead',
            phone: '010-11111111',
            email: 'fe@example.com',
            createTime: '2024-01-01 09:00:00',
          },
          {
            id: 5,
            parentId: 2,
            name: 'Backend Group',
            code: 'BE',
            sort: 2,
            status: 'active',
            leader: 'Backend Lead',
            phone: '010-22222222',
            email: 'be@example.com',
            createTime: '2024-01-01 09:00:00',
          },
        ],
      },
      {
        id: 3,
        parentId: 1,
        name: 'HR Department',
        code: 'HR',
        sort: 2,
        status: 'active',
        leader: 'HRD',
        phone: '010-33333333',
        email: 'hr@example.com',
        createTime: '2024-01-01 09:00:00',
      },
    ],
  },
]

// 扁平化部门列表（辅助函数）
const flattenDepartments = (depts: any[], list: any[] = []) => {
  depts.forEach(dept => {
    const { children, ...rest } = dept
    list.push(rest)
    if (children) {
      flattenDepartments(children, list)
    }
  })
  return list
}

export default [
  {
    url: '/api/department/list',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: departmentList,
      }
    },
  },
  {
    url: '/api/department/create',
    method: 'post',
    response: ({ body }: { body: any }) => {
      // 简化处理，实际应添加到树中
      return {
        code: 200,
        message: 'success',
        data: { id: Date.now(), ...body, createTime: new Date().toLocaleString() },
      }
    },
  },
  {
    url: '/api/department/update',
    method: 'put',
    response: ({ body }: { body: any }) => {
      return {
        code: 200,
        message: 'success',
        data: body,
      }
    },
  },
  {
    url: RegExp('/api/department/.*'),
    method: 'delete',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: null,
      }
    },
  },
]
