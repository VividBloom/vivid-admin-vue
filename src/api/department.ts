import request from '@/utils/request'

export interface Department {
  id: number
  parentId: number | null
  name: string
  code: string
  sort: number
  status: string
  leader: string
  phone: string
  email: string
  createTime: string
  children?: Department[]
}

export const getDepartmentList = (params?: any) => {
  return request.get<Department[]>('/department/list', { params })
}

export const createDepartment = (data: Partial<Department>) => {
  return request.post('/department/create', data)
}

export const updateDepartment = (data: Partial<Department>) => {
  return request.put('/department/update', data)
}

export const deleteDepartment = (id: number) => {
  return request.delete(`/department/${id}`)
}
