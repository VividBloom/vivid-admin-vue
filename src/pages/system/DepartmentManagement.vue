<!--
  部门管理页面
  - 树形表格展示部门
  - 支持部门的增删改查
-->
<template>
  <div class="department-management">
    <div class="page-header">
      <h2>{{ $t('department.title') }}</h2>
      <el-button
        v-permission="'system:department'"
        v-track="{ module: 'Department', action: 'Click Create Button' }"
        type="primary"
        @click="handleCreate"
      >
        <el-icon><div class="i-ep-plus" /></el-icon>
        {{ $t('department.newDepartment') }}
      </el-button>
    </div>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="departmentList"
        style="width: 100%"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" :label="$t('department.name')" width="250" />
        <el-table-column prop="code" :label="$t('department.code')" width="150" />
        <el-table-column prop="leader" :label="$t('department.leader')" width="150" />
        <el-table-column prop="phone" :label="$t('department.phone')" width="150" />
        <el-table-column prop="status" :label="$t('department.status')" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? $t('common.enable') : $t('common.disable') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" :label="$t('department.sort')" width="80" />
        <el-table-column prop="createTime" :label="$t('common.createTime')" width="180" />
        <el-table-column :label="$t('common.action')" width="200" fixed="right">
          <template #default="scope">
            <el-button
              v-permission="'system:department'"
              v-track="{
                module: 'Department',
                action: 'Click Edit Button',
                details: `Edit Department ID: ${scope.row.id}`,
              }"
              size="small"
              type="primary"
              @click="editDepartment(scope.row)"
            >
              {{ $t('common.edit') }}
            </el-button>
            <el-button
              v-permission="'system:department'"
              v-track="{
                module: 'Department',
                action: 'Click Delete Button',
                details: `Delete Department ID: ${scope.row.id}`,
              }"
              size="small"
              type="danger"
              @click="deleteDepartment(scope.row)"
            >
              {{ $t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 弹窗 -->
    <el-dialog
      v-model="showDialog"
      :title="isEdit ? $t('department.editDepartment') : $t('department.newDepartment')"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="$t('department.parentDepartment')" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="departmentList"
            :props="{ children: 'children', label: 'name' }"
            check-strictly
            clearable
            :render-after-expand="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('department.name')" prop="name">
          <el-input v-model="form.name" :placeholder="$t('department.enterName')" />
        </el-form-item>
        <el-form-item :label="$t('department.code')" prop="code">
          <el-input v-model="form.code" :placeholder="$t('department.enterCode')" />
        </el-form-item>
        <el-form-item :label="$t('department.leader')" prop="leader">
          <el-input v-model="form.leader" :placeholder="$t('department.enterLeader')" />
        </el-form-item>
        <el-form-item :label="$t('department.phone')" prop="phone">
          <el-input v-model="form.phone" :placeholder="$t('department.enterPhone')" />
        </el-form-item>
        <el-form-item :label="$t('department.sort')" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item :label="$t('department.status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">{{ $t('common.enable') }}</el-radio>
            <el-radio label="inactive">{{ $t('common.disable') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  getDepartmentList,
  createDepartment,
  updateDepartment,
  deleteDepartment as deleteDepartmentApi,
} from '@/api/department'

const { t } = useI18n()

// 状态
const loading = ref(false)
const departmentList = ref<any[]>([])
const showDialog = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref()

// 表单数据
const form = reactive({
  id: undefined,
  parentId: null as number | null,
  name: '',
  code: '',
  leader: '',
  phone: '',
  sort: 0,
  status: 'active',
})

const rules = computed(() => ({
  name: [{ required: true, message: t('department.enterName'), trigger: 'blur' }],
  code: [{ required: true, message: t('department.enterCode'), trigger: 'blur' }],
}))

// 获取数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getDepartmentList()
    if (res.code === 200) {
      departmentList.value = res.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 操作
const handleCreate = () => {
  isEdit.value = false
  Object.assign(form, {
    id: undefined,
    parentId: null,
    name: '',
    code: '',
    leader: '',
    phone: '',
    sort: 0,
    status: 'active',
  })
  showDialog.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const editDepartment = (row: any) => {
  isEdit.value = true
  Object.assign(form, row)
  showDialog.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const deleteDepartment = async (row: any) => {
  try {
    await ElMessageBox.confirm(t('common.confirmDelete', { name: row.name }), t('common.warning'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
    })
    await deleteDepartmentApi(row.id)
    ElMessage.success(t('common.deleteSuccess'))
    loadData()
  } catch (error) {
    // Cancel or error
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          await updateDepartment(form)
          ElMessage.success(t('common.updateSuccess'))
        } else {
          await createDepartment(form)
          ElMessage.success(t('common.createSuccess'))
        }
        showDialog.value = false
        loadData()
      } catch (error) {
        console.error(error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.department-management {
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
}
</style>
