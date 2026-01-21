// src/mock/index.ts
import type { MockMethod } from 'vite-plugin-mock'
// 导入来自 mock-server 的接口规则
import {
  userMocks,
  dashboardMocks,
  commonMocks,
  userManagementMocks,
  permissionMocks,
  roleMocks,
  userRoleMocks,
} from './mock-server'
// 将所有 Mock 接口规则合并到一个数组中并导出
export default [
  ...userMocks,
  ...dashboardMocks,
  ...commonMocks,
  ...userManagementMocks,
  ...permissionMocks,
  ...roleMocks,
  ...userRoleMocks,
] as MockMethod[]
