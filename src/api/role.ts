import request from '@/utils/request'

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
