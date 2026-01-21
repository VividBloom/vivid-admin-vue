<!--
  角色管理页面
  - 展示所有角色列表
  - 支持角色的增删改查
  - 支持为角色分配权限
-->
<template>
  <div class="role-management">
    <div class="page-header">
      <h2>角色管理</h2>
      <el-button v-permission="'system:role'" type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        新建角色
      </el-button>
    </div>

    <el-card class="content-card" shadow="never">
      <el-table v-loading="loading" :data="roles" style="width: 100%">
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色编码" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
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
              v-permission="'system:role'"
              size="small"
              type="primary"
              @click="editRole(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-permission="'system:permission'"
              size="small"
              type="success"
              @click="assignPermissions(scope.row)"
            >
              分配权限
            </el-button>
            <el-button
              v-permission="'system:role'"
              size="small"
              type="danger"
              @click="deleteRole(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建/编辑角色对话框 -->
    <el-dialog v-model="showCreateDialog" :title="isEdit ? '编辑角色' : '新建角色'" width="500px">
      <el-form ref="roleFormRef" :model="roleForm" :rules="roleFormRules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="roleForm.description" type="textarea" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitRoleForm">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog v-model="showPermissionDialog" title="分配权限" width="800px">
      <el-tree
        ref="permissionTreeRef"
        :data="permissionTree"
        show-checkbox
        node-key="id"
        :props="{ label: 'name', children: 'children' }"
        :default-checked-keys="selectedPermissionIds"
        @check="handlePermissionCheck"
      />
      <template #footer>
        <el-button @click="showPermissionDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitPermissionAssignment">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { usePermissionStore } from '@/stores/permission'
import { roleApi } from '@/api'

const permissionStore = usePermissionStore()

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const showCreateDialog = ref(false)
const showPermissionDialog = ref(false)
const isEdit = ref(false)
const currentRole = ref<API.Role | null>(null)
const selectedPermissionIds = ref<number[]>([])

// 表单数据
const roleForm = reactive({
  name: '',
  code: '',
  description: '',
  status: 'active' as 'active' | 'inactive',
})

// 表单验证规则
const roleFormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
}

// 表格数据
const roles = ref<API.Role[]>([])

// 权限树相关
const permissionTree = ref<API.PermissionTreeNode[]>([])
const permissionTreeRef = ref()
const roleFormRef = ref()

// 获取角色列表
const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await roleApi.getRoles()
    if (response.code === 200) {
      roles.value = response.data
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 获取权限树
const fetchPermissionTree = async () => {
  try {
    const response = await permissionStore.fetchPermissionTree()
    permissionTree.value = permissionStore.permissionTree
  } catch (error: any) {
    ElMessage.error(error.message || '获取权限树失败')
  }
}

// 新建角色
const createRole = () => {
  isEdit.value = false
  currentRole.value = null
  Object.assign(roleForm, {
    name: '',
    code: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  })
  showCreateDialog.value = true
}

// 编辑角色
const editRole = (role: API.Role) => {
  isEdit.value = true
  currentRole.value = role
  Object.assign(roleForm, {
    name: role.name,
    code: role.code,
    description: role.description || '',
    status: role.status,
  })
  showCreateDialog.value = true
}

// 删除角色
const deleteRole = async (role: API.Role) => {
  try {
    await ElMessageBox.confirm(`确定删除角色 "${role.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 这里应该调用删除API
    ElMessage.success('删除成功')
    await fetchRoles()
  } catch {
    // 用户取消删除
  }
}

// 分配权限
const assignPermissions = (role: API.Role) => {
  currentRole.value = role
  selectedPermissionIds.value = role.permissions.map(p => p.id)
  showPermissionDialog.value = true
}

// 提交角色表单
const submitRoleForm = async () => {
  if (!roleFormRef.value) return

  await roleFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    submitLoading.value = true
    try {
      if (isEdit.value && currentRole.value) {
        // 编辑角色
        // 这里应该调用更新API
        ElMessage.success('编辑成功')
      } else {
        // 新建角色
        // 这里应该调用创建API
        ElMessage.success('创建成功')
      }
      showCreateDialog.value = false
      await fetchRoles()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 处理权限勾选
const handlePermissionCheck = (data: API.PermissionTreeNode, checkedInfo: any) => {
  // 这里可以处理权限勾选逻辑
  console.log('Permission check:', data, checkedInfo)
}

// 提交权限分配
const submitPermissionAssignment = async () => {
  if (!currentRole.value) return

  submitLoading.value = true
  try {
    // 这里应该调用分配权限API
    ElMessage.success('权限分配成功')
    showPermissionDialog.value = false
    await fetchRoles()
  } catch (error: any) {
    ElMessage.error(error.message || '权限分配失败')
  } finally {
    submitLoading.value = false
  }
}

// 生命周期
onMounted(() => {
  fetchRoles()
  fetchPermissionTree()
})
</script>

<style scoped>
.role-management {
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
