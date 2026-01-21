import type { MockMethod } from 'vite-plugin-mock'
import { dashboardData, resultSuccess } from './data'

// 仪表盘数据接口
export const dashboardMocks: MockMethod[] = [
  {
    url: '/api/dashboard/data',
    method: 'get',
    timeout: 400,
    response: () => resultSuccess(dashboardData),
  },
  {
    url: '/api/transactions/realtime',
    method: 'get',
    response: () =>
      resultSuccess([
        {
          id: 'ORD001',
          user: 'User A',
          amount: 299,
          status: 'success',
          time: '2025-01-17 10:30:00',
        },
        {
          id: 'ORD002',
          user: 'User B',
          amount: 159,
          status: 'pending',
          time: '2025-01-17 10:25:00',
        },
        {
          id: 'ORD003',
          user: 'User C',
          amount: 899,
          status: 'success',
          time: '2025-01-17 10:20:00',
        },
      ]),
  },
]
