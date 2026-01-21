import type { MockMethod } from 'vite-plugin-mock'

// 消息通知 Mock 数据
const notices = [
  {
    id: '1',
    type: 'message',
    title: '您收到了一封新邮件',
    description: '来自系统管理员的系统通知',
    datetime: '2025-01-22 10:00:00',
    read: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  },
  {
    id: '2',
    type: 'message',
    title: '用户 User1 申请更改密码',
    description: '请及时处理用户的密码重置请求',
    datetime: '2025-01-22 09:30:00',
    read: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
  },
  {
    id: '3',
    type: 'task',
    title: '完成本月报表统计',
    description: '任务截止时间：2025-01-31',
    datetime: '2025-01-20 14:00:00',
    read: false,
    tag: {
      type: 'danger',
      text: '紧急',
    },
  },
  {
    id: '4',
    type: 'task',
    title: '修复生产环境 Bug #1024',
    description: '指派人：CTO',
    datetime: '2025-01-21 16:00:00',
    read: false,
    tag: {
      type: 'primary',
      text: '进行中',
    },
  },
  {
    id: '5',
    type: 'todo',
    title: '代码审查 (Code Review)',
    description: 'PR #123 需要您的审查',
    datetime: '2025-01-22 08:00:00',
    read: false,
  },
]

export default [
  {
    url: '/api/notice/list',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: notices,
      }
    },
  },
] as MockMethod[]
