<!--
  用户管理页面
  - 展示所有用户列表
  - 支持用户的增删改查
-->
<template>
  <div class="user-management">
    <div class="page-header">
      <h2>{{ $t('userList.title') }}</h2>
      <div class="flex gap-2">
        <el-button v-permission="'system:user'" type="primary" @click="handleCreate">
          <el-icon>
            <div class="i-ep-plus" />
          </el-icon>
          {{ $t('userList.newUser') }}
        </el-button>
        <el-button type="success" @click="handleExport">
          <el-icon>
            <div class="i-ep-download" />
          </el-icon>
          {{ $t('common.export') }}
        </el-button>
        <el-upload
          action=""
          :show-file-list="false"
          :before-upload="handleBeforeUpload"
          accept=".xlsx, .xls"
        >
          <el-button type="warning">
            <el-icon>
              <div class="i-ep-upload" />
            </el-icon>
            {{ $t('common.import') }}
          </el-button>
        </el-upload>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧部门树 -->
      <el-col :span="6">
        <el-card class="box-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ $t('department.title') }}</span>
            </div>
          </template>
          <el-tree
            :data="departmentList"
            :props="defaultProps"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>

      <!-- 右侧用户列表 -->
      <el-col :span="18">
        <el-card class="content-card" shadow="never">
          <el-table v-loading="loading" :data="userList" style="width: 100%">
            <el-table-column prop="id" :label="$t('userList.id')" width="80" />
            <el-table-column prop="username" :label="$t('userList.username')" width="120" />
            <el-table-column prop="email" :label="$t('userList.email')" min-width="200" />
            <el-table-column prop="phone" :label="$t('userList.phone')" width="130" />
            <el-table-column prop="role" :label="$t('userList.role')" width="150">
              <template #default="scope">
                <el-tag v-for="role in scope.row.roles" :key="role.id" size="small" class="mr-1">
                  {{ role.name }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" :label="$t('userList.status')" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)">
                  {{ getStatusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" :label="$t('userList.createTime')" width="180" />
            <el-table-column :label="$t('userList.action')" width="200" fixed="right">
              <template #default="scope">
                <el-button
                  v-permission="'system:user'"
                  size="small"
                  type="primary"
                  @click="editUser(scope.row)"
                >
                  {{ $t('userList.editUser') }}
                </el-button>
                <el-button
                  v-permission="'system:user'"
                  size="small"
                  type="success"
                  @click="viewDetail(scope.row.id)"
                >
                  {{ $t('userList.detail') }}
                </el-button>
                <el-button
                  v-permission="'system:user'"
                  size="small"
                  type="danger"
                  @click="deleteUser(scope.row)"
                >
                  {{ $t('userList.delete') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <CommonPagination
            :pagination="pagination"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 新建/编辑用户对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEdit ? $t('userList.editUser') : $t('userList.newUser')"
      width="500px"
    >
      <el-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="80px">
        <el-form-item :label="$t('userList.username')" prop="username">
          <el-input v-model="userForm.username" :placeholder="$t('login.usernamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('userList.email')" prop="email">
          <el-input v-model="userForm.email" :placeholder="$t('profile.enterEmail')" />
        </el-form-item>
        <el-form-item :label="$t('userList.phone')" prop="phone">
          <el-input v-model="userForm.phone" :placeholder="$t('profile.enterPhone')" />
        </el-form-item>
        <el-form-item :label="$t('userList.department')" prop="deptId">
          <el-tree-select
            v-model="userForm.deptId"
            :data="departmentList"
            :props="defaultProps"
            check-strictly
            :render-after-expand="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('userList.role')" prop="roleIds">
          <el-select v-model="userForm.roleIds" multiple :placeholder="$t('userList.selectRole')">
            <el-option
              v-for="role in roleList"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('userList.permission')">
          <el-tree
            ref="permissionTreeRef"
            :data="permissionTree"
            show-checkbox
            node-key="id"
            :props="treeProps"
            :default-checked-keys="userForm.permissionIds"
            @check="handlePermissionCheck"
          />
        </el-form-item>
        <el-form-item :label="$t('userList.status')" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio v-for="item in userStatusOptions" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">{{ $t('app.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitUserForm">
          {{ $t('app.ok') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { exportExcel, readExcel } from '@/utils/excel'
import { roleApi, permissionApi, userApi } from '@/api'
import { getDepartmentList } from '@/api/department'
import { useI18n } from 'vue-i18n'
import { useCurd } from '@/composables/useCurd'
import CommonPagination from '@/components/CommonPagination.vue'
import { useDictStore } from '@/stores/dictionary'

const { t } = useI18n()
const router = useRouter()
const dictStore = useDictStore()

// 部门数据
const departmentList = ref<any[]>([])
const selectedDeptId = ref<number | null>(null)
const defaultProps = {
  children: 'children',
  label: 'name',
}

// 获取部门列表
const fetchDepartments = async () => {
  try {
    const res = await getDepartmentList()
    if (res.code === 200) {
      departmentList.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch departments:', error)
  }
}

// 点击部门节点
const handleNodeClick = (data: any) => {
  selectedDeptId.value = data.id
  loadUserList()
}

// 字典数据
const userStatusOptions = computed(() => dictStore.dictCache.userStatus || [])

// 字典辅助函数
const getStatusLabel = (status: string) => {
  const item = userStatusOptions.value.find(i => i.value === status)
  if (item) return item.label
  return status === 'active' ? t('userList.enable') : t('userList.disable')
}

const getStatusTagType = (status: string) => {
  const item = userStatusOptions.value.find(i => i.value === status)
  if (item) return item.tagType as any
  return status === 'active' ? 'success' : 'danger'
}

// 树形控件配置
const treeProps = {
  label: (data: any) => t(data.name),
  children: 'children',
}

// 组合式函数
const {
  // 表格状态
  loading,
  data: userList,
  pagination,
  refresh: loadUserList,
  handleSizeChange,
  handleCurrentChange,
  // 弹窗状态
  visible: showCreateDialog,
  isEdit,
  submitLoading,
  openCreate,
  openEdit,
  closeDialog,
  // CRUD 操作
  handleDelete: handleDeleteRaw,
  submitForm: submitFormRaw,
} = useCurd({
  fetchDataApi: async (params: any) => {
    try {
      // 合并部门筛选参数
      const queryParams = {
        ...params,
        deptId: selectedDeptId.value,
      }
      return await userApi.getUserList(queryParams)
    } catch (error: any) {
      // 模拟数据 (fallback if API fails)
      return {
        code: 200,
        data: [
          {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            phone: '13800138000',
            roles: [
              {
                id: 1,
                name: 'Admin',
                code: 'admin',
                status: 'active',
                permissions: [],
                createTime: '',
                updateTime: '',
              },
              {
                id: 1,
                name: 'Admin',
                code: 'admin',
                status: 'active',
                permissions: [],
                createTime: '',
                updateTime: '',
              },
            ],
            permissions: [],
            status: 'active',
            createTime: '2025-01-01 10:00:00',
          },
        ],
      }
    }
  },
  createApi: userApi.createUser,
  updateApi: userApi.updateUser,
  deleteApi: userApi.deleteUser,
  immediate: false,
})

// 导出 Excel
const handleExport = () => {
  const header = [
    { key: 'id', title: t('userList.id') },
    { key: 'username', title: t('userList.username') },
    { key: 'email', title: t('userList.email') },
    { key: 'phone', title: t('userList.phone') },
    { key: 'status', title: t('userList.status') },
    { key: 'createTime', title: t('userList.createTime') },
  ]
  const data = userList.value.map((user: any) => ({
    ...user,
    status: user.status === 'active' ? t('userList.enable') : t('userList.disable'),
  }))
  exportExcel({
    header,
    data,
    filename: 'user-list',
  })
}

// 导入 Excel
const handleBeforeUpload = async (file: File) => {
  try {
    const data = await readExcel(file)
    console.log('Imported data:', data)
    ElMessage.success(t('common.importSuccess') + `: ${data.length} items`)
    // TODO: 调用批量创建 API
    // await userApi.batchCreateUser(data)
    loadUserList()
  } catch (error) {
    console.error(error)
    ElMessage.error(t('common.importFailed'))
  }
  return false
}

const currentUser = ref<any>(null)

// 角色和权限数据
const roleList = ref<API.Role[]>([])
const permissionTree = ref<API.PermissionTreeNode[]>([])
const permissionTreeRef = ref()

// 表单数据
const userForm = reactive({
  username: '',
  email: '',
  phone: '',
  deptId: null as number | null,
  roleIds: [] as number[],
  permissionIds: [] as number[],
  status: 'active' as 'active' | 'inactive',
})

// 表单验证规则
const userFormRules = computed(() => ({
  username: [{ required: true, message: t('login.usernamePlaceholder'), trigger: 'blur' }],
  email: [{ required: true, message: t('profile.enterEmail'), trigger: 'blur' }],
  roleIds: [{ required: true, message: t('userList.selectRole'), trigger: 'change' }],
}))

// 表单引用
const userFormRef = ref()

defineOptions({ name: 'UserList' })

// 获取角色列表
const fetchRoles = async () => {
  try {
    const response = await roleApi.getRoles()
    if (response.code === 200) {
      roleList.value = response.data
    }
  } catch (error: any) {
    // ElMessage.error(error.message || '获取角色列表失败')
    // 模拟数据
    roleList.value = [
      {
        id: 1,
        name: t('role.admin'),
        code: 'admin',
        status: 'active',
        permissions: [],
        createTime: '',
        updateTime: '',
      },
      {
        id: 2,
        name: t('role.commonUser'),
        code: 'user',
        status: 'active',
        permissions: [],
        createTime: '',
        updateTime: '',
      },
    ]
  }
}

// 获取权限树
const fetchPermissionTree = async () => {
  try {
    const response = await permissionApi.getPermissionTree()
    if (response.code === 200) {
      permissionTree.value = response.data
    }
  } catch (error: any) {
    // ElMessage.error(error.message || '获取权限树失败')
    // 模拟数据
    permissionTree.value = [
      {
        id: 1,
        name: 'System Management',
        code: 'system',
        type: 'menu',
        sort: 1,
        status: 'active',
        createTime: '',
        updateTime: '',
        children: [
          {
            id: 2,
            name: 'User Management',
            code: 'system:user',
            type: 'menu',
            sort: 1,
            status: 'active',
            createTime: '',
            updateTime: '',
            children: [],
          },
          {
            id: 3,
            name: 'Role Management',
            code: 'system:role',
            type: 'menu',
            sort: 2,
            status: 'active',
            createTime: '',
            updateTime: '',
            children: [],
          },
        ],
      },
    ]
  }
}

// 处理权限勾选
const handlePermissionCheck = (_: any, checkedInfo: any) => {
  userForm.permissionIds = checkedInfo.checkedKeys
}

// 查看用户详情
const viewDetail = (userId: number) => {
  router.push({ name: 'UserDetail', params: { id: userId } })
}

// 新建用户
const handleCreate = () => {
  openCreate()
  currentUser.value = null
  Object.assign(userForm, {
    username: '',
    email: '',
    phone: '',
    deptId: null,
    roleIds: [],
    permissionIds: [],
    status: 'active',
  })
  // showCreateDialog.value = true // Handled by openCreate
  nextTick(() => {
    if (permissionTreeRef.value) {
      permissionTreeRef.value.setCheckedKeys([])
    }
    if (userFormRef.value) {
      userFormRef.value.clearValidate()
    }
  })
}

// 编辑用户
const editUser = (user: any) => {
  openEdit()
  currentUser.value = user
  Object.assign(userForm, {
    username: user.username,
    email: user.email,
    phone: user.phone || '',
    deptId: user.deptId || null,
    roleIds: user.roles ? user.roles.map((r: any) => r.id) : [],
    permissionIds: user.permissions ? user.permissions.map((p: any) => p.id) : [],
    status: user.status,
  })
  // showCreateDialog.value = true // Handled by openEdit
  // 设置权限树选中状态
  nextTick(() => {
    if (permissionTreeRef.value) {
      permissionTreeRef.value.setCheckedKeys(userForm.permissionIds)
    }
  })
}

// 删除用户
const deleteUser = async (user: any) => {
  await handleDeleteRaw(user, t('userList.confirmDelete', { username: user.username }))
}

// 提交用户表单
const submitUserForm = async () => {
  const submitData = {
    ...userForm,
    id: isEdit.value ? currentUser.value?.id : undefined,
  }
  const successMsg = isEdit.value ? t('userList.updateSuccess') : t('userList.createSuccess')
  await submitFormRaw(userFormRef.value, submitData, successMsg)
}

// 生命周期
onMounted(() => {
  dictStore.getDict('userStatus')
  fetchDepartments()
  loadUserList()
  fetchRoles()
  fetchPermissionTree()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  /* color: #333; */
}

.content-card {
  margin-top: 0; /* Adjusted to fit in layout */
}

.box-card {
  height: 100%;
}
</style>
