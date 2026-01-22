import request from '@/utils/request'

export interface FileItem {
  id: string
  name: string
  url: string
  type: string
  size: number
  createTime: string
}

export const fileApi = {
  uploadFile(data: FormData) {
    return request.post<FileItem>('/file/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  getFileList() {
    return request.get<FileItem[]>('/file/list')
  },

  deleteFile(id: string) {
    return request.delete<boolean>('/file/delete', {
      params: { id },
    })
  },
}
