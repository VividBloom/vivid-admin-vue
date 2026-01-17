declare namespace API {
  // 用户信息
  interface User {
    id: number
    username: string
    email: string
    phone?: string
    avatar?: string
    role: string
    createTime: string
    status: 'active' | 'inactive'
  }

  // 菜单信息
  interface Menu {
    id: number
    name: string
    path: string
    icon?: string
    children?: Menu[]
  }

  // 仪表盘数据
  interface DashboardData {
    totalUsers: number
    totalOrders: number
    totalRevenue?: number
    conversionRate?: number
    avgConversion: number
  }
}
