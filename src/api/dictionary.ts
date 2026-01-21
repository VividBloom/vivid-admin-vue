import request from '@/utils/request'

export interface DictType {
  id: number
  name: string
  code: string
  status: string
  description: string
  createTime: string
}

export interface DictItem {
  id: number
  dictCode: string
  label: string
  value: string
  sort: number
  status: string
  tagType: string
}

export const getDictTypes = (params?: any) => {
  return request.get('/dict/type/list', { params })
}

export const getDictItems = (typeCode: string) => {
  return request.get('/dict/item/list', { params: { typeCode } })
}

export const addDictType = (data: any) => {
  return request.post('/dict/type', data)
}

export const updateDictType = (data: any) => {
  return request.put('/dict/type', data)
}

export const deleteDictType = (id: number) => {
  return request.delete(`/dict/type/${id}`)
}

export const addDictItem = (data: any) => {
  return request.post('/dict/item', data)
}

export const updateDictItem = (data: any) => {
  return request.put('/dict/item', data)
}

export const deleteDictItem = (id: number) => {
  return request.delete(`/dict/item/${id}`)
}
