import type { MockMethod } from 'vite-plugin-mock'
import { resultSuccess, resultError } from './data'

const fileList = [
  {
    id: '1',
    name: 'example-image.png',
    url: 'https://element-plus.org/images/element-plus-logo.svg',
    type: 'image/png',
    size: 1024 * 50,
    createTime: '2023-05-20 12:00:00',
  },
  {
    id: '2',
    name: 'document.pdf',
    url: 'https://example.com/document.pdf',
    type: 'application/pdf',
    size: 1024 * 1024 * 2,
    createTime: '2023-05-21 14:30:00',
  },
]

export const fileMocks: MockMethod[] = [
  {
    url: '/api/file/upload',
    method: 'post',
    response: ({ body, query, headers }: any) => {
      // In a real scenario, we would process the multipart/form-data here
      // For mock, we just return a success response with a fake URL
      return resultSuccess({
        id: Math.random().toString(36).substr(2, 9),
        name: 'uploaded-file.png',
        url: 'https://element-plus.org/images/element-plus-logo.svg',
        type: 'image/png',
        size: Math.floor(Math.random() * 1000000),
        createTime: new Date().toLocaleString(),
      })
    },
  },
  {
    url: '/api/file/list',
    method: 'get',
    response: () => {
      return resultSuccess(fileList)
    },
  },
  {
    url: '/api/file/delete',
    method: 'delete',
    response: ({ query }: any) => {
      const { id } = query
      const index = fileList.findIndex(item => item.id === id)
      if (index !== -1) {
        fileList.splice(index, 1)
      }
      return resultSuccess(true)
    },
  },
]

export default fileMocks
