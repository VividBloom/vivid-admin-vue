import type { MockMethod } from 'vite-plugin-mock'

import { userMocks } from './auth'
import { dashboardMocks } from './dashboard'
import { commonMocks } from './common'
import { userManagementMocks, userRoleMocks } from './user'
import { permissionMocks } from './permission'
import { roleMocks } from './role'
import { logMocks } from './log'
import { dictMocks } from './dictionary'
import departmentMocks from './department'
import { fileMocks } from './file'

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
  ...dictMocks,
  ...departmentMocks,
  ...fileMocks,
] as MockMethod[]
