export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  token: string
  userInfo: UserInfo
  expiresIn?: number
}

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
  permissions?: string[]
}

export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateUserParams {
  email?: string
  phone?: string
  avatar?: string
}
