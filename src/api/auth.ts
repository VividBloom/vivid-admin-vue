import request, { type ResponseData } from '@/utils/request'
import type {
  LoginParams,
  LoginResponse,
  ChangePasswordParams,
  UpdateUserParams,
} from '@/types/user'

export const loginApi = (data: LoginParams): Promise<ResponseData<LoginResponse>> => {
  return request.post('/auth/login', data)
}

export const logoutApi = (): Promise<ResponseData<void>> => {
  return request.post('/auth/logout')
}

export const getUserInfoApi = (): Promise<ResponseData> => {
  return request.get('/auth/userinfo')
}

export const changePasswordApi = (data: ChangePasswordParams): Promise<ResponseData> => {
  return request.put('/auth/password', data)
}

export const updateUserInfoApi = (data: UpdateUserParams): Promise<ResponseData> => {
  return request.put('/auth/userinfo', data)
}
