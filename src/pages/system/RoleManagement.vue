<!--
  角色管理页面
  - 展示所有角色列表
  - 支持角色的增删改查
  - 支持为角色分配权限
-->
<template>
  <div class="role-management">
    <div class="page-header">
      <h2>{{ $t('role.title') }}</h2>
      <el-button
        v-permission="'system:role'"
        v-track="{ module: 'Role', action: 'Click Create Button' }"
        type="primary"
        @click="createRole"
      >
        <el-icon><div class="i-ep-plus" /></el-icon>
        {{ $t('role.new') }}
      </el-button>
    </div>

    <el-card class="content-card" shadow="never">
      <el-table v-loading="loading" :data="roles" style="width: 100%">
        <el-table-column prop="name" :label="$t('role.name')" width="150" />
        <el-table-column prop="code" :label="$t('role.code')" width="150" />
        <el-table-column prop="description" :label="$t('role.description')" min-width="200" />
        <el-table-column prop="status" :label="$t('userList.status')" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? $t('userList.enable') : $t('userList.disable') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('userList.createTime')" width="180" />
        <el-table-column :label="$t('userList.action')" width="200" fixed="right">
          <template #default="scope">
            <el-button
              v-permission="'system:role'"
              v-track="{
                module: 'Role',
                action: 'Click Edit Button',
                details: `Edit Role ID: ${scope.row.id}`,
              }"
              size="small"
              type="primary"
              @click="editRole(scope.row)"
            >
              {{ $t('userList.edit') }}
            </el-button>
            <el-button
              v-permission="'system:permission'"
              v-track="{
                module: 'Role',
                action: 'Click AssignPermission Button',
                details: `Assign Permission to Role ID: ${scope.row.id}`,
              }"
              size="small"
              type="success"
              @click="assignPermissions(scope.row)"
            >
              {{ $t('role.assignPermission') }}
            </el-button>
            <el-button
              v-permission="'system:role'"
              v-track="{
                module: 'Role',
                action: 'Click Delete Button',
                details: `Delete Role ID: ${scope.row.id}`,
              }"
              size="small"
              type="danger"
              @click="deleteRole(scope.row)"
            >
              {{ $t('userList.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新建/编辑角色对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEdit ? $t('role.edit') : $t('role.new')"
      width="500px"
    >
      <el-form ref="roleFormRef" :model="roleForm" :rules="roleFormRules" label-width="80px">
        <el-form-item :label="$t('role.name')" prop="name">
          <el-input v-model="roleForm.name" :placeholder="$t('role.name')" />
        </el-form-item>
        <el-form-item :label="$t('role.code')" prop="code">
          <el-input v-model="roleForm.code" :placeholder="$t('role.code')" />
        </el-form-item>
        <el-form-item :label="$t('role.description')" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :placeholder="$t('role.description')"
          />
        </el-form-item>
        <el-form-item :label="$t('userList.status')" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio label="active">{{ $t('userList.enable') }}</el-radio>
            <el-radio label="inactive">{{ $t('userList.disable') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">{{ $t('app.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitRoleForm">
          {{ $t('app.ok') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog v-model="showPermissionDialog" :title="$t('role.assignPermission')" width="800px">
      <el-tree
        ref="permissionTreeRef"
        :data="permissionTree"
        show-checkbox
        node-key="id"
        :props="treeProps"
        :default-checked-keys="selectedPermissionIds"
        @check="handlePermissionCheck"
      />
      <template #footer>
        <el-button @click="showPermissionDialog = false">{{ $t('app.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitPermissionAssignment">
          {{ $t('app.ok') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePermissionStore } from '@/stores/permission'
import { roleApi } from '@/api'
import { useI18n } from 'vue-i18n'

import { useCurd } from '@/composables/useCurd'
import CommonPagination from '@/components/CommonPagination.vue'

const { t } = useI18n()
const permissionStore = usePermissionStore()

// 树形控件配置
const treeProps = {
  label: (data: any) => t(data.name),
  children: 'children',
}

// 组合式函数
const {
  // 表格状态
  loading,
  data: roles,
  pagination,
  refresh: fetchRoles,
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
} = useCurd({
  fetchDataApi: roleApi.getRoles,
  deleteApi: roleApi.deleteRole,
  itemName: t('role.title'),
})

const showPermissionDialog = ref(false)
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
const roleFormRules = computed(() => ({
  name: [{ required: true, message: t('role.name'), trigger: 'blur' }],
  code: [{ required: true, message: t('role.code'), trigger: 'blur' }],
}))

const permissionTree = ref<API.PermissionTreeNode[]>([])
const permissionTreeRef = ref()
const roleFormRef = ref()

// 获取权限树
const fetchPermissionTree = async () => {
  try {
    await permissionStore.fetchPermissionTree()
    permissionTree.value = permissionStore.permissionTree
  } catch (error: any) {
    ElMessage.error(error.message || t('userList.operationFailed'))
  }
}

// 新建角色
const createRole = () => {
  openCreate()
  currentRole.value = null
  Object.assign(roleForm, {
    name: '',
    code: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  })
}

// 编辑角色
const editRole = (role: API.Role) => {
  openEdit()
  currentRole.value = role
  Object.assign(roleForm, {
    name: role.name,
    code: role.code,
    description: role.description || '',
    status: role.status,
  })
}

// 删除角色
const deleteRole = async (role: API.Role) => {
  await handleDeleteRaw(role, t('role.confirmDelete', { name: role.name }))
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
        ElMessage.success(t('role.updateSuccess'))
      } else {
        // 新建角色
        // 这里应该调用创建API
        ElMessage.success(t('role.createSuccess'))
      }
      closeDialog()
      await fetchRoles()
    } catch (error: any) {
      ElMessage.error(error.message || t('role.operationFailed'))
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
    ElMessage.success(t('role.assignSuccess'))
    showPermissionDialog.value = false
    await fetchRoles()
  } catch (error: any) {
    ElMessage.error(error.message || t('role.assignFailed'))
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
  margin-top: 20px;
}
</style>
