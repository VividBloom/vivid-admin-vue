import request from '@/utils/request'

// 用户相关 API
export const userApi = {
  // 登录
  login: (data: { username: string; password: string }) =>
    request.post<{ token: string; userInfo: API.User }>('/auth/login', data),

  // 获取用户信息
  getUserInfo: () => request.get<API.User>('/auth/userinfo'),

  // 退出登录
  logout: () => request.post('/auth/logout'),
}

// 系统相关 API
export const systemApi = {
  // 获取菜单
  getMenus: () => request.get<API.Menu[]>('/system/menus'),

  // 获取仪表盘数据
  getDashboard: () => request.get<API.DashboardData>('/dashboard/data'),
}
