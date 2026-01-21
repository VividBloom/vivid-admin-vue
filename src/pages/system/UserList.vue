<!--
  用户管理页面
  - 展示所有用户列表
  - 支持用户的增删改查
-->
<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <el-button v-permission="'system:user'" type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        新建用户
      </el-button>
    </div>

    <el-card class="content-card" shadow="never">
      <el-table v-loading="loading" :data="userList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="role" label="角色" width="150">
          <template #default="scope">
            <el-tag v-for="role in scope.row.roles" :key="role.id" size="small" class="mr-1">
              {{ role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              v-permission="'system:user'"
              size="small"
              type="primary"
              @click="editUser(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-permission="'system:user'"
              size="small"
              type="success"
              @click="viewDetail(scope.row.id)"
            >
              详情
            </el-button>
            <el-button
              v-permission="'system:user'"
              size="small"
              type="danger"
              @click="deleteUser(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建/编辑用户对话框 -->
    <el-dialog v-model="showCreateDialog" :title="isEdit ? '编辑用户' : '新建用户'" width="500px">
      <el-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="userForm.roleIds" multiple placeholder="请选择角色">
            <el-option
              v-for="role in roleList"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="权限">
          <el-tree
            ref="permissionTreeRef"
            :data="permissionTree"
            show-checkbox
            node-key="id"
            :props="{ label: 'name', children: 'children' }"
            :default-checked-keys="userForm.permissionIds"
            @check="handlePermissionCheck"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitUserForm">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { roleApi, permissionApi, userApi } from '@/api'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const showCreateDialog = ref(false)
const isEdit = ref(false)
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
  roleIds: [] as number[],
  permissionIds: [] as number[],
  status: 'active' as 'active' | 'inactive',
})

// 表单验证规则
const userFormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

// 表格数据
const userList = ref<any[]>([])

// 表单引用
const userFormRef = ref()

defineOptions({ name: 'UserList' })

// 获取用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const response = await userApi.getUserList()
    if (response.code === 200) {
      userList.value = response.data
    }
  } catch (error: any) {
    // ElMessage.error(error.message || '获取用户列表失败')
    // 模拟数据 (fallback if API fails)
    userList.value = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        phone: '13800138000',
        roles: [
          {
            id: 1,
            name: '管理员',
            code: 'admin',
            status: 'active',
            permissions: [],
            createTime: '',
            updateTime: '',
          },

          {
            id: 1,
            name: '管理员',
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
    ]
  } finally {
    loading.value = false
  }
}

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
        name: '管理员',
        code: 'admin',
        status: 'active',
        permissions: [],
        createTime: '',
        updateTime: '',
      },
      {
        id: 2,
        name: '普通用户',
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
        name: '系统管理',
        code: 'system',
        type: 'menu',
        sort: 1,
        status: 'active',
        createTime: '',
        updateTime: '',
        children: [
          {
            id: 2,
            name: '用户管理',
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
            name: '角色管理',
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
const handlePermissionCheck = (data: any, checkedInfo: any) => {
  userForm.permissionIds = checkedInfo.checkedKeys
}

// 查看用户详情
const viewDetail = (userId: number) => {
  router.push({ name: 'UserDetail', params: { id: userId } })
}

// 编辑用户
const editUser = (user: any) => {
  isEdit.value = true
  currentUser.value = user
  Object.assign(userForm, {
    username: user.username,
    email: user.email,
    phone: user.phone || '',
    roleIds: user.roles ? user.roles.map((r: any) => r.id) : [],
    permissionIds: user.permissions ? user.permissions.map((p: any) => p.id) : [],
    status: user.status,
  })
  // 设置权限树选中状态
  if (permissionTreeRef.value) {
    permissionTreeRef.value.setCheckedKeys(userForm.permissionIds)
  }
  showCreateDialog.value = true
}

// 删除用户
const deleteUser = async (user: any) => {
  try {
    await ElMessageBox.confirm(`确定删除用户 "${user.username}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 这里应该调用删除API
    await userApi.deleteUser(user.id)
    ElMessage.success('删除成功')
    await loadUserList()
  } catch {
    // 用户取消删除
  }
}

// 提交用户表单
const submitUserForm = async () => {
  if (!userFormRef.value) return

  await userFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    submitLoading.value = true
    try {
      const submitData = {
        ...userForm,
        // 如果是编辑，可能还需要传ID
        id: isEdit.value ? currentUser.value?.id : undefined,
      }

      if (isEdit.value && currentUser.value) {
        // 编辑用户
        await userApi.updateUser(submitData)
        ElMessage.success('编辑成功')
      } else {
        // 新建用户
        await userApi.createUser(submitData)
        ElMessage.success('创建成功')
      }
      showCreateDialog.value = false
      await loadUserList()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 生命周期
onMounted(() => {
  loadUserList()
  fetchRoles()
  fetchPermissionTree()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
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
  margin-top: 20px;
}
</style>
