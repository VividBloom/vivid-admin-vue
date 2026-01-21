declare namespace API {
  // 用户信息
  interface User {
    id: number
    username: string
    email: string
    phone?: string
    avatar?: string
    role: string
    createTime: string
    status: 'active' | 'inactive'
  }

  // 菜单信息
  interface Menu {
    id: number
    name: string
    path: string
    icon?: string
    children?: Menu[]
  }

  // 仪表盘数据
  interface DashboardData {
    totalUsers: number
    totalOrders: number
    totalRevenue?: number
    conversionRate?: number
    avgConversion: number
  }

  // RBAC 权限管理相关类型

  // 权限信息
  interface Permission {
    id: number
    name: string
    code: string
    type: 'menu' | 'button' | 'api'
    parentId?: number
    path?: string
    icon?: string
    sort: number
    status: 'active' | 'inactive'
    createTime: string
    updateTime: string
  }

  // 角色信息
  interface Role {
    id: number
    name: string
    code: string
    description?: string
    status: 'active' | 'inactive'
    permissions: Permission[]
    createTime: string
    updateTime: string
  }

  // 用户角色关系
  interface UserRole {
    userId: number
    roleId: number
  }

  // 角色权限关系
  interface RolePermission {
    roleId: number
    permissionId: number
  }

  // 权限树节点
  interface PermissionTreeNode extends Permission {
    children?: PermissionTreeNode[]
  }

  // 用户权限信息
  interface UserPermissions {
    roles: Role[]
    permissions: Permission[]
    menus: PermissionTreeNode[]
  }
}
