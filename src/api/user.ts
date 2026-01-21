import request from '@/utils/request'

// 用户相关 API (User Management)
// Note: Auth related APIs (login, logout, getUserInfo) are in ./auth.ts
export const userApi = {
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
