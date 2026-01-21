<template>
  <div class="dictionary-management p-4">
    <el-row :gutter="20">
      <!-- Left: Dictionary Types -->
      <el-col :span="10">
        <el-card shadow="never">
          <template #header>
            <div class="flex justify-between items-center">
              <span>{{ $t('dict.name') }}</span>
              <el-button type="primary" size="small" @click="handleCreateType">
                <el-icon><Plus /></el-icon>
                {{ $t('app.add') }}
              </el-button>
            </div>
          </template>

          <el-table
            v-loading="typeLoading"
            :data="typeList"
            highlight-current-row
            style="width: 100%"
            @current-change="handleTypeSelect"
          >
            <el-table-column prop="name" :label="$t('dict.name')" />
            <el-table-column prop="code" :label="$t('dict.code')" />
            <el-table-column :label="$t('dict.action')" width="100">
              <template #default="scope">
                <el-button type="primary" link @click.stop="handleEditType(scope.row)">
                  {{ $t('app.edit') || 'Edit' }}
                </el-button>
                <el-button type="danger" link @click.stop="handleDeleteType(scope.row)">
                  {{ $t('app.delete') || 'Delete' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- Right: Dictionary Items -->
      <el-col :span="14">
        <el-card shadow="never">
          <template #header>
            <div class="flex justify-between items-center">
              <span>{{
                currentType ? `${currentType.name} - ${$t('dict.itemList')}` : $t('dict.itemList')
              }}</span>
              <el-button
                type="primary"
                size="small"
                :disabled="!currentType"
                @click="handleCreateItem"
              >
                <el-icon><Plus /></el-icon>
                {{ $t('app.add') }}
              </el-button>
            </div>
          </template>

          <div v-if="!currentType" class="text-center text-gray-400 py-10">
            {{ $t('dict.selectTypeHint') }}
          </div>

          <el-table v-else v-loading="itemLoading" :data="itemList" style="width: 100%">
            <el-table-column prop="label" :label="$t('dict.label')" />
            <el-table-column prop="value" :label="$t('dict.value')" />
            <el-table-column prop="tagType" :label="$t('dict.tagType')">
              <template #default="scope">
                <el-tag :type="scope.row.tagType || ''">{{
                  scope.row.tagType || 'default'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort" :label="$t('dict.sort')" width="80" />
            <el-table-column prop="status" :label="$t('dict.status')" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('dict.action')" width="150">
              <template #default="scope">
                <el-button type="primary" link @click="handleEditItem(scope.row)">
                  {{ $t('app.edit') || 'Edit' }}
                </el-button>
                <el-button type="danger" link @click="handleDeleteItem(scope.row)">
                  {{ $t('app.delete') || 'Delete' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- Type Dialog -->
    <el-dialog
      v-model="typeDialogVisible"
      :title="isTypeEdit ? $t('dict.editType') : $t('dict.addType')"
      width="500px"
    >
      <el-form :model="typeForm" label-width="80px">
        <el-form-item :label="$t('dict.name')" required>
          <el-input v-model="typeForm.name" />
        </el-form-item>
        <el-form-item :label="$t('dict.code')" required>
          <el-input v-model="typeForm.code" :disabled="isTypeEdit" />
        </el-form-item>
        <el-form-item :label="$t('dict.description')">
          <el-input v-model="typeForm.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">{{ $t('app.cancel') }}</el-button>
        <el-button type="primary" @click="submitTypeForm">{{ $t('app.ok') }}</el-button>
      </template>
    </el-dialog>

    <!-- Item Dialog -->
    <el-dialog
      v-model="itemDialogVisible"
      :title="isItemEdit ? $t('dict.editItem') : $t('dict.addItem')"
      width="500px"
    >
      <el-form :model="itemForm" label-width="80px">
        <el-form-item :label="$t('dict.label')" required>
          <el-input v-model="itemForm.label" />
        </el-form-item>
        <el-form-item :label="$t('dict.value')" required>
          <el-input v-model="itemForm.value" />
        </el-form-item>
        <el-form-item :label="$t('dict.tagType')">
          <el-select v-model="itemForm.tagType">
            <el-option label="Default" value="" />
            <el-option label="Primary" value="primary" />
            <el-option label="Success" value="success" />
            <el-option label="Info" value="info" />
            <el-option label="Warning" value="warning" />
            <el-option label="Danger" value="danger" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('dict.sort')">
          <el-input-number v-model="itemForm.sort" :min="0" />
        </el-form-item>
        <el-form-item :label="$t('dict.status')">
          <el-switch v-model="itemForm.status" active-value="active" inactive-value="inactive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialogVisible = false">{{ $t('app.cancel') }}</el-button>
        <el-button type="primary" @click="submitItemForm">{{ $t('app.ok') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { dictApi } from '@/api'
import type { DictType, DictItem } from '@/api/dictionary'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Type State
const typeLoading = ref(false)
const typeList = ref<DictType[]>([])
const currentType = ref<DictType | null>(null)
const typeDialogVisible = ref(false)
const isTypeEdit = ref(false)
const typeForm = reactive({
  id: 0,
  name: '',
  code: '',
  description: '',
  status: 'active',
})

// Item State
const itemLoading = ref(false)
const itemList = ref<DictItem[]>([])
const itemDialogVisible = ref(false)
const isItemEdit = ref(false)
const itemForm = reactive({
  id: 0,
  dictCode: '',
  label: '',
  value: '',
  sort: 0,
  tagType: '',
  status: 'active',
})

// Fetch Types
const fetchTypes = async () => {
  typeLoading.value = true
  try {
    const res = await dictApi.getDictTypes()
    if (res.code === 200) {
      typeList.value = res.data.list
    }
  } catch (error) {
    console.error(error)
  } finally {
    typeLoading.value = false
  }
}

// Fetch Items
const fetchItems = async (typeCode: string) => {
  itemLoading.value = true
  try {
    const res = await dictApi.getDictItems(typeCode)
    if (res.code === 200) {
      itemList.value = res.data
    }
  } catch (error) {
    console.error(error)
    itemList.value = []
  } finally {
    itemLoading.value = false
  }
}

// Handlers for Type
const handleTypeSelect = (row: DictType | undefined) => {
  if (row) {
    currentType.value = row
    fetchItems(row.code)
  }
}

const handleCreateType = () => {
  isTypeEdit.value = false
  typeForm.id = 0
  typeForm.name = ''
  typeForm.code = ''
  typeForm.description = ''
  typeForm.status = 'active'
  typeDialogVisible.value = true
}

const handleEditType = (row: DictType) => {
  isTypeEdit.value = true
  Object.assign(typeForm, row)
  typeDialogVisible.value = true
}

const handleDeleteType = (row: DictType) => {
  ElMessageBox.confirm(
    t('app.confirmLogout') ? 'Are you sure to delete this dictionary?' : 'Confirm delete?',
    'Warning',
    {
      type: 'warning',
    }
  ).then(async () => {
    try {
      await dictApi.deleteDictType(row.id)
      ElMessage.success('Deleted successfully')
      fetchTypes()
      if (currentType.value?.id === row.id) {
        currentType.value = null
        itemList.value = []
      }
    } catch (error) {
      console.error(error)
    }
  })
}

const submitTypeForm = async () => {
  try {
    if (isTypeEdit.value) {
      await dictApi.updateDictType(typeForm)
    } else {
      await dictApi.addDictType(typeForm)
    }
    ElMessage.success(isTypeEdit.value ? 'Updated successfully' : 'Created successfully')
    typeDialogVisible.value = false
    fetchTypes()
  } catch (error) {
    console.error(error)
  }
}

// Handlers for Item
const handleCreateItem = () => {
  if (!currentType.value) return
  isItemEdit.value = false
  itemForm.id = 0
  itemForm.dictCode = currentType.value.code
  itemForm.label = ''
  itemForm.value = ''
  itemForm.sort = 0
  itemForm.tagType = ''
  itemForm.status = 'active'
  itemDialogVisible.value = true
}

const handleEditItem = (row: DictItem) => {
  isItemEdit.value = true
  Object.assign(itemForm, row)
  itemDialogVisible.value = true
}

const handleDeleteItem = (row: DictItem) => {
  ElMessageBox.confirm('Are you sure to delete this item?', 'Warning', {
    type: 'warning',
  }).then(async () => {
    try {
      await dictApi.deleteDictItem(row.id)
      ElMessage.success('Deleted successfully')
      if (currentType.value) {
        fetchItems(currentType.value.code)
      }
    } catch (error) {
      console.error(error)
    }
  })
}

const submitItemForm = async () => {
  try {
    if (isItemEdit.value) {
      await dictApi.updateDictItem(itemForm)
    } else {
      await dictApi.addDictItem(itemForm)
    }
    ElMessage.success(isItemEdit.value ? 'Updated successfully' : 'Created successfully')
    itemDialogVisible.value = false
    if (currentType.value) {
      fetchItems(currentType.value.code)
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchTypes()
})
</script>

<style scoped>
.dictionary-management {
  height: 100%;
}
</style>
