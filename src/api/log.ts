import request from '@/utils/request'

export interface LogData {
  module: string
  action: string
  details?: string
  status?: 'success' | 'fail'
}

export const logApi = {
  getLogs: (params: any) => request.get('/log/list', { params } as any),
  createLog: (data: LogData) => request.post('/log/create', data),
}
