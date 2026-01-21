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
      <h2>权限管理</h2>
      <el-button v-permission="'system:permission'" type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        新建权限
      </el-button>
    </div>

    <el-row :gutter="16">
      <!-- 左：权限树 -->
      <el-col :xs="24" :md="8">
        <el-card class="content-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>权限树</span>
              <el-button size="small" type="primary" link @click="reloadPermissions">
                <el-icon><Refresh /></el-icon>刷新
              </el-button>
            </div>
          </template>
          <el-tree
            v-loading="treeLoading"
            :data="permissionTree"
            node-key="id"
            :props="{ label: 'name', children: 'children' }"
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
              <span>权限列表</span>
              <div class="card-actions">
                <el-select
                  v-model="filter.type"
                  placeholder="类型"
                  size="small"
                  style="width: 120px"
                >
                  <el-option label="全部" value="" />
                  <el-option label="菜单" value="menu" />
                  <el-option label="按钮" value="button" />
                  <el-option label="接口" value="api" />
                </el-select>
                <el-select
                  v-model="filter.status"
                  placeholder="状态"
                  size="small"
                  style="width: 120px"
                >
                  <el-option label="全部" value="" />
                  <el-option label="启用" value="active" />
                  <el-option label="禁用" value="inactive" />
                </el-select>
                <el-input
                  v-model="filter.keyword"
                  placeholder="名称/编码"
                  size="small"
                  clearable
                  style="width: 180px"
                  @keyup.enter="applyFilter"
                />
                <el-button size="small" type="primary" @click="applyFilter">查询</el-button>
                <el-button size="small" @click="resetFilter">重置</el-button>
              </div>
            </div>
          </template>

          <el-table v-loading="listLoading" :data="filteredPermissions" style="width: 100%">
            <el-table-column prop="name" label="名称" min-width="140" />
            <el-table-column prop="code" label="编码" min-width="140" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="scope">
                <el-tag :type="typeTagType(scope.row.type)">
                  {{ typeLabel(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="path" label="路径" min-width="160" />
            <el-table-column prop="parentId" label="父级ID" width="90" />
            <el-table-column prop="sort" label="排序" width="80" />
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
                  v-permission="'system:permission'"
                  size="small"
                  type="primary"
                  @click="editPermission(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-permission="'system:permission'"
                  size="small"
                  type="danger"
                  @click="deletePermission(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新建/编辑权限对话框 -->
    <el-dialog v-model="showDialog" :title="isEdit ? '编辑权限' : '新建权限'" width="600px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入权限编码（唯一）" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="menu">菜单</el-radio>
            <el-radio label="button">按钮</el-radio>
            <el-radio label="api">接口</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="父级权限" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="permissionTree"
            :props="{ label: 'name', children: 'children' }"
            placeholder="请选择父级（可选）"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="form.path" placeholder="菜单路由/接口地址（根据类型填写）" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="菜单图标（仅菜单类型可用）" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { usePermissionStore } from '@/stores/permission'
import { permissionApi } from '@/api'

// Store：统一管理权限数据
const permissionStore = usePermissionStore()

// 加载状态
const treeLoading = ref(false)
const listLoading = ref(false)
const submitLoading = ref(false)

// 对话框状态
const showDialog = ref(false)
const isEdit = ref(false)

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
const formRules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限编码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择权限类型', trigger: 'change' }],
}

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
        ? [p.name, p.code].some(text => text?.toLowerCase().includes(filter.keyword.toLowerCase()))
        : true
    )
    .filter(p => (filter.parentId ? p.parentId === filter.parentId : true))
})

// 类型显示
const typeLabel = (t: 'menu' | 'button' | 'api') =>
  t === 'menu' ? '菜单' : t === 'button' ? '按钮' : '接口'
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
    ElMessage.success('权限数据已刷新')
  } catch (error: any) {
    ElMessage.error(error.message || '刷新失败')
  } finally {
    treeLoading.value = false
    listLoading.value = false
  }
}

// 打开新建窗口
const openCreateDialog = () => {
  isEdit.value = false
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
  showDialog.value = true
}

// 编辑权限
const editPermission = (p: API.Permission) => {
  isEdit.value = true
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
  showDialog.value = true
}

// 删除权限
const deletePermission = async (p: API.Permission) => {
  try {
    await ElMessageBox.confirm(`确定删除权限 "${p.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await permissionApi.deletePermission(p.id)
    ElMessage.success('删除成功')
    await reloadPermissions()
  } catch {
    // 用户取消或失败
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
        ElMessage.success('编辑成功')
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
        ElMessage.success('创建成功')
      }
      showDialog.value = false
      await reloadPermissions()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
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

align-items: center;
