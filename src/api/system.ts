import request from '@/utils/request'

// 系统相关 API
export const systemApi = {
  // 获取菜单
  getMenus: () => request.get<API.Menu[]>('/system/menus'),

  // 获取仪表盘数据
  getDashboard: () => request.get<API.DashboardData>('/dashboard/data'),
}
