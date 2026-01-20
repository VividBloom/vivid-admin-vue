/**
 * 与用户认证相关的 API 封装
 * - 统一使用项目的 request 实例，返回约定的 ResponseData 类型
 */
import request, { type ResponseData } from '@/utils/request'
import type {
  LoginParams,
  LoginResponse,
  ChangePasswordParams,
  UpdateUserParams,
} from '@/types/user'

// 登录接口：返回包含 token 与用户信息的数据
export const loginApi = (data: LoginParams): Promise<ResponseData<LoginResponse>> => {
  return request.post('/auth/login', data)
}

// 登出接口
export const logoutApi = (): Promise<ResponseData<void>> => {
  return request.post('/auth/logout')
}

// 获取当前用户信息
export const getUserInfoApi = (): Promise<ResponseData> => {
  return request.get('/auth/userinfo')
}

// 修改密码接口
export const changePasswordApi = (data: ChangePasswordParams): Promise<ResponseData> => {
  return request.put('/auth/password', data)
}

// 更新用户信息
export const updateUserInfoApi = (data: UpdateUserParams): Promise<ResponseData> => {
  return request.put('/auth/userinfo', data)
}
