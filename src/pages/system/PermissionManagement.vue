<!--
  权限管理页面
  - 展示权限列表与权限树
  - 支持权限的增删改查（名称、编码、类型、路径、父级、状态等）
  - 使用 v-permission 指令控制操作按钮显示
-->
<template>
  <div class="permission-management">
    <!-- 页面头部：标题 + 新建按钮 -->
    <div class="page-header">
      <h2>{{ $t('permission.title') }}</h2>
      <el-button v-permission="'system:permission'" type="primary" @click="openCreateDialog">
        <el-icon><div class="i-ep-plus" /></el-icon>
        {{ $t('permission.new') }}
      </el-button>
    </div>

    <el-row :gutter="16">
      <!-- 左：权限树 -->
      <el-col :xs="24" :md="8">
        <el-card class="content-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ $t('permission.tree') }}</span>
              <el-button size="small" type="primary" link @click="reloadPermissions">
                <el-icon><div class="i-ep-refresh" /></el-icon>{{ $t('tagsView.refresh') }}
              </el-button>
            </div>
          </template>
          <el-tree
            v-loading="treeLoading"
            :data="permissionTree"
            node-key="id"
            :props="treeProps"
            highlight-current
            default-expand-all
            @node-click="handleTreeNodeClick"
          />
        </el-card>
      </el-col>

      <!-- 右：权限列表 -->
      <el-col :xs="24" :md="16">
        <el-card class="content-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ $t('permission.list') }}</span>
              <div class="card-actions">
                <el-select
                  v-model="filter.type"
                  :placeholder="$t('permission.type')"
                  size="small"
                  style="width: 120px"
                >
                  <el-option :label="$t('permission.all')" value="" />
                  <el-option :label="$t('permission.menu')" value="menu" />
                  <el-option :label="$t('permission.button')" value="button" />
                  <el-option :label="$t('permission.api')" value="api" />
                </el-select>
                <el-select
                  v-model="filter.status"
                  :placeholder="$t('userList.status')"
                  size="small"
                  style="width: 120px"
                >
                  <el-option :label="$t('permission.all')" value="" />
                  <el-option :label="$t('userList.enable')" value="active" />
                  <el-option :label="$t('userList.disable')" value="inactive" />
                </el-select>
                <el-input
                  v-model="filter.keyword"
                  :placeholder="$t('permission.keyword')"
                  size="small"
                  clearable
                  style="width: 180px"
                  @keyup.enter="applyFilter"
                />
                <el-button size="small" type="primary" @click="applyFilter">
                  {{ $t('app.confirm') }}
                </el-button>
                <el-button size="small" @click="resetFilter">{{ $t('app.reset') }}</el-button>
              </div>
            </div>
          </template>

          <el-table v-loading="listLoading" :data="filteredPermissions" style="width: 100%">
            <el-table-column prop="name" :label="$t('permission.name')" min-width="140">
              <template #default="scope">
                {{ $t(scope.row.name) }}
              </template>
            </el-table-column>
            <el-table-column prop="code" :label="$t('permission.code')" min-width="140" />
            <el-table-column prop="type" :label="$t('permission.type')" width="100">
              <template #default="scope">
                <el-tag :type="typeTagType(scope.row.type)">
                  {{ typeLabel(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="path" :label="$t('permission.path')" min-width="160" />
            <el-table-column prop="parentId" :label="$t('permission.parentId')" width="90" />
            <el-table-column prop="sort" :label="$t('permission.sort')" width="80" />
            <el-table-column prop="status" :label="$t('userList.status')" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                  {{
                    scope.row.status === 'active' ? $t('userList.enable') : $t('userList.disable')
                  }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" :label="$t('userList.createTime')" width="180" />
            <el-table-column :label="$t('userList.action')" width="200" fixed="right">
              <template #default="scope">
                <el-button
                  v-permission="'system:permission'"
                  size="small"
                  type="primary"
                  @click="editPermission(scope.row)"
                >
                  {{ $t('userList.edit') }}
                </el-button>
                <el-button
                  v-permission="'system:permission'"
                  size="small"
                  type="danger"
                  @click="deletePermission(scope.row)"
                >
                  {{ $t('userList.delete') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新建/编辑权限对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="isEdit ? $t('userList.editUser') : $t('permission.new')"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item :label="$t('permission.name')" prop="name">
          <el-input v-model="form.name" :placeholder="$t('permission.enterName')" />
        </el-form-item>
        <el-form-item :label="$t('permission.code')" prop="code">
          <el-input v-model="form.code" :placeholder="$t('permission.enterCode')" />
        </el-form-item>
        <el-form-item :label="$t('permission.type')" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="menu">{{ $t('permission.menu') }}</el-radio>
            <el-radio label="button">{{ $t('permission.button') }}</el-radio>
            <el-radio label="api">{{ $t('permission.api') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('permission.parent')" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="permissionTree"
            :props="treeProps"
            :placeholder="$t('permission.selectParent')"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('permission.path')" prop="path">
          <el-input v-model="form.path" :placeholder="$t('permission.enterPath')" />
        </el-form-item>
        <el-form-item :label="$t('permission.icon')" prop="icon">
          <el-input v-model="form.icon" :placeholder="$t('permission.enterIcon')" />
        </el-form-item>
        <el-form-item :label="$t('permission.sort')" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item :label="$t('userList.status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">{{ $t('userList.enable') }}</el-radio>
            <el-radio label="inactive">{{ $t('userList.disable') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">{{ $t('app.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">
          {{ $t('app.ok') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePermissionStore } from '@/stores/permission'
import { permissionApi } from '@/api'
import { useI18n } from 'vue-i18n'

import { useDialog } from '@/composables/useDialog'

const { t } = useI18n()
const permissionStore = usePermissionStore()

// 树形控件配置
const treeProps = {
  label: (data: any) => t(data.name),
  children: 'children',
}

// 加载状态
const treeLoading = ref(false)
const listLoading = ref(false)

// 对话框状态
const {
  visible: showDialog,
  isEdit,
  submitLoading,
  openCreate,
  openEdit,
  closeDialog,
} = useDialog()

// 过滤条件
const filter = reactive({
  type: '' as '' | 'menu' | 'button' | 'api',
  status: '' as '' | 'active' | 'inactive',
  keyword: '',
  parentId: undefined as number | undefined,
})

// 表单数据
const form = reactive({
  id: undefined as number | undefined,
  name: '',
  code: '',
  type: 'menu' as 'menu' | 'button' | 'api',
  parentId: undefined as number | undefined,
  path: '',
  icon: '',
  sort: 0,
  status: 'active' as 'active' | 'inactive',
})

// 表单校验规则
const formRules = computed(() => ({
  name: [{ required: true, message: t('permission.enterName'), trigger: 'blur' }],
  code: [{ required: true, message: t('permission.enterCode'), trigger: 'blur' }],
  type: [{ required: true, message: t('permission.type'), trigger: 'change' }],
}))

// 基础数据源
const permissionTree = computed(() => permissionStore.permissionTree)
const allPermissions = computed(() => permissionStore.allPermissions)

// 过滤后的列表
const filteredPermissions = computed(() => {
  return allPermissions.value
    .filter(p => (filter.type ? p.type === filter.type : true))
    .filter(p => (filter.status ? p.status === filter.status : true))
    .filter(p =>
      filter.keyword
        ? [t(p.name), p.name, p.code].some(text =>
            text?.toLowerCase().includes(filter.keyword.toLowerCase())
          )
        : true
    )
    .filter(p => (filter.parentId ? p.parentId === filter.parentId : true))
})

// 类型显示
const typeLabel = (type: 'menu' | 'button' | 'api') => {
  const map: Record<string, string> = {
    menu: t('permission.menu'),
    button: t('permission.button'),
    api: t('permission.api'),
  }
  return map[type] || type
}
const typeTagType = (t: 'menu' | 'button' | 'api') =>
  t === 'menu' ? 'info' : t === 'button' ? 'warning' : 'success'

// 表单/树引用
const formRef = ref()

// 刷新权限数据
const reloadPermissions = async () => {
  treeLoading.value = true
  listLoading.value = true
  try {
    await Promise.all([
      permissionStore.fetchPermissionTree(),
      permissionStore.fetchAllPermissions(),
    ])
    ElMessage.success(t('permission.refreshSuccess'))
  } catch (error: any) {
    ElMessage.error(error.message || t('app.refreshFailed'))
  } finally {
    treeLoading.value = false
    listLoading.value = false
  }
}

// 打开新建窗口
const openCreateDialog = () => {
  openCreate()
  Object.assign(form, {
    id: undefined,
    name: '',
    code: '',
    type: 'menu',
    parentId: undefined,
    path: '',
    icon: '',
    sort: 0,
    status: 'active',
  })
  // showDialog.value = true // Handled by openCreate
}

// 编辑权限
const editPermission = (p: API.Permission) => {
  openEdit()
  Object.assign(form, {
    id: p.id,
    name: p.name,
    code: p.code,
    type: p.type,
    parentId: p.parentId,
    path: p.path || '',
    icon: p.icon || '',
    sort: p.sort ?? 0,
    status: p.status,
  })
  // showDialog.value = true // Handled by openEdit
}

// 删除权限
const deletePermission = async (p: API.Permission) => {
  try {
    await ElMessageBox.confirm(
      t('permission.confirmDelete', { name: t(p.name) }),
      t('app.confirm'),
      {
        confirmButtonText: t('app.ok'),
        cancelButtonText: t('app.cancel'),
        type: 'warning',
      }
    )
    await permissionApi.deletePermission(p.id!)
    ElMessage.success(t('userList.deleteSuccess'))
    await reloadPermissions()
  } catch {
    // User cancelled
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (isEdit.value && form.id) {
        await permissionApi.updatePermission(form.id, {
          name: form.name,
          code: form.code,
          type: form.type,
          parentId: form.parentId,
          path: form.path,
          icon: form.icon,
          sort: form.sort,
          status: form.status,
        })
        ElMessage.success(t('userList.updateSuccess'))
      } else {
        await permissionApi.createPermission({
          name: form.name,
          code: form.code,
          type: form.type,
          parentId: form.parentId,
          path: form.path,
          icon: form.icon,
          sort: form.sort,
          status: form.status,
        } as any)
        ElMessage.success(t('userList.createSuccess'))
      }
      closeDialog()
      await reloadPermissions()
    } catch (error: any) {
      ElMessage.error(error.message || t('userList.operationFailed'))
    } finally {
      submitLoading.value = false
    }
  })
}

// 点击树节点进行过滤
const handleTreeNodeClick = (node: API.PermissionTreeNode) => {
  filter.parentId = node?.id
  applyFilter()
}

// 过滤操作
const applyFilter = () => {
  // 计算属性 filteredPermissions 会自动响应
}
const resetFilter = () => {
  Object.assign(filter, { type: '', status: '', keyword: '', parentId: undefined })
}

// 初始化
onMounted(async () => {
  await reloadPermissions()
})
</script>

<style scoped>
.permission-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.content-card {
  margin-top: 0;
}
</style>
