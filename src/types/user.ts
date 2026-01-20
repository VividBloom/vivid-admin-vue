/**
 * 文件说明：用户相关类型定义
 * - 本文件集中声明与用户认证、用户信息、以及修改用户相关的请求/响应类型
 * - 目的：为 API 层与业务代码提供类型约束并便于阅读维护（添加中文注释不会影响编译）
 */

/**
 * 登录接口参数
 * - `remember`：可选，记住登录状态（客户端决定如何持久化）
 */
export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

/**
 * 登录接口返回数据
 * - 包含用于鉴权的 `token` 以及后端返回的当前用户信息 `userInfo`
 */
export interface LoginResponse {
  token: string
  userInfo: UserInfo
  expiresIn?: number // 可选：token 到期时间（秒）
}

/**
 * 用户信息（后端返回的用户实体结构）
 * - 注意：不要在持久化层长期保存敏感字段（如密码或危险权限）
 */
export interface UserInfo {
  id: number
  username: string
  email: string
  phone?: string
  avatar?: string
  role: string
  createTime: string
  lastLoginTime?: string
  status: 'active' | 'inactive'
  permissions?: string[] // 可选：权限字符串列表（用于前端权限判断）
}

/**
 * 修改密码请求参数
 */
export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * 更新用户信息参数（可选字段）
 */
export interface UpdateUserParams {
  email?: string
  phone?: string
  avatar?: string
}
