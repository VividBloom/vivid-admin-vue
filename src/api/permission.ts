import request from '@/utils/request'

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
