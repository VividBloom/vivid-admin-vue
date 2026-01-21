import request from '@/utils/request'

export const logApi = {
  getLogs: (params: any) => request.get('/log/list', { params } as any),
}
