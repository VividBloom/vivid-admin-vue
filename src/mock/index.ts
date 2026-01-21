import type { MockMethod } from 'vite-plugin-mock'

import { userMocks } from './auth'
import { dashboardMocks } from './dashboard'
import { commonMocks } from './common'
import { userManagementMocks, userRoleMocks } from './user'
import { permissionMocks } from './permission'
import { roleMocks } from './role'
import { logMocks } from './log'

// 将所有 Mock 接口规则合并到一个数组中并导出
export default [
  ...userMocks,
  ...dashboardMocks,
  ...commonMocks,
  ...userManagementMocks,
  ...permissionMocks,
  ...roleMocks,
  ...userRoleMocks,
  ...logMocks,
] as MockMethod[]
