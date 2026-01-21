import request from '@/utils/request'

export interface NoticeItem {
  id: string
  type: 'message' | 'task' | 'todo'
  title: string
  description?: string
  datetime: string
  read: boolean
  avatar?: string
  tag?: {
    type: 'primary' | 'success' | 'info' | 'warning' | 'danger'
    text: string
  }
}

export const getNoticeList = () => {
  return request.get<NoticeItem[]>('/notice/list')
}
