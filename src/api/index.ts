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

  // 获取用户列表
  getUserList: (params?: any) => request.get<API.User[]>('/user/list', { params } as any),

  // 创建用户
  createUser: (data: Partial<API.User> & { roleIds?: number[]; permissionIds?: number[] }) =>
    request.post<API.User>('/user/create', data),

  // 更新用户
  updateUser: (data: Partial<API.User> & { roleIds?: number[]; permissionIds?: number[] }) =>
    request.put<API.User>(`/user/update/${data.id}`, data),

  // 删除用户
  deleteUser: (id: number) => request.delete(`/user/delete/${id}`),
}

// 系统相关 API
export const systemApi = {
  // 获取菜单
  getMenus: () => request.get<API.Menu[]>('/system/menus'),

  // 获取仪表盘数据
  getDashboard: () => request.get<API.DashboardData>('/dashboard/data'),
}

// 权限管理相关 API
export const permissionApi = {
  // 获取所有权限
  getPermissions: () => request.get<API.Permission[]>('/permission/list'),

  // 获取权限树
  getPermissionTree: () => request.get<API.PermissionTreeNode[]>('/permission/tree'),

  // 创建权限
  createPermission: (data: Omit<API.Permission, 'id' | 'createTime' | 'updateTime'>) =>
    request.post<API.Permission>('/permission/create', data),

  // 更新权限
  updatePermission: (id: number, data: Partial<API.Permission>) =>
    request.put<API.Permission>(`/permission/update/${id}`, data),

  // 删除权限
  deletePermission: (id: number) => request.delete(`/permission/delete/${id}`),

  // 获取用户权限信息
  getUserPermissions: () => request.get<API.UserPermissions>('/permission/user'),
}

// 角色管理相关 API
export const roleApi = {
  // 获取所有角色
  getRoles: () => request.get<API.Role[]>('/role/list'),

  // 获取角色详情（包含权限）
  getRoleDetail: (id: number) => request.get<API.Role>(`/role/detail/${id}`),

  // 创建角色
  createRole: (data: Omit<API.Role, 'id' | 'createTime' | 'updateTime'>) =>
    request.post<API.Role>('/role/create', data),

  // 更新角色
  updateRole: (id: number, data: Partial<API.Role>) =>
    request.put<API.Role>(`/role/update/${id}`, data),

  // 删除角色
  deleteRole: (id: number) => request.delete(`/role/delete/${id}`),

  // 为角色分配权限
  assignPermissions: (roleId: number, permissionIds: number[]) =>
    request.post(`/role/${roleId}/permissions`, { permissionIds }),

  // 获取角色的权限
  getRolePermissions: (roleId: number) =>
    request.get<API.Permission[]>(`/role/${roleId}/permissions`),
}

// 用户角色管理相关 API
export const userRoleApi = {
  // 获取用户角色
  getUserRoles: (userId: number) => request.get<API.Role[]>(`/user/${userId}/roles`),

  // 为用户分配角色
  assignRoles: (userId: number, roleIds: number[]) =>
    request.post(`/user/${userId}/roles`, { roleIds }),

  // 移除用户角色
  removeRole: (userId: number, roleId: number) => request.delete(`/user/${userId}/roles/${roleId}`),
}
