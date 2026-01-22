import type { MockMethod } from 'vite-plugin-mock'
import { resultSuccess, resultError } from './data'

const fileList = [
  {
    id: '1',
    name: 'element-plus-logo.svg',
    url: 'https://element-plus.org/images/element-plus-logo.svg',
    type: 'image/svg+xml',
    size: 1024 * 20,
    createTime: '2023-05-20 12:00:00',
  },
  {
    id: '2',
    name: 'test.docx',
    url: 'https://static.shanhuxueyuan.com/test.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 1024 * 15,
    createTime: '2023-05-21 09:30:00',
  },
  {
    id: '3',
    name: 'test.xlsx',
    url: 'https://static.shanhuxueyuan.com/test.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 1024 * 12,
    createTime: '2023-05-22 14:15:00',
  },
  {
    id: '4',
    name: 'test.pdf',
    url: 'https://static.shanhuxueyuan.com/test.pdf',
    type: 'application/pdf',
    size: 1024 * 500,
    createTime: '2023-05-23 16:45:00',
  },
  {
    id: '5',
    name: 'test.pptx',
    url: 'https://static.shanhuxueyuan.com/test.pptx',
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 1024 * 1024 * 2,
    createTime: '2023-05-24 10:20:00',
  },
  {
    id: '6',
    name: 'moby-dick.epub',
    url: 'https://s3.amazonaws.com/moby-dick/moby-dick.epub',
    type: 'application/epub+zip',
    size: 1024 * 800,
    createTime: '2023-05-25 11:10:00',
  },
  {
    id: '7',
    name: 'roadmap.xmind',
    url: 'https://raw.githubusercontent.com/xmindltd/xmind-sdk-js/master/demo/workbook.xmind',
    type: 'application/vnd.xmind.workbook',
    size: 1024 * 200,
    createTime: '2023-05-26 09:00:00',
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
