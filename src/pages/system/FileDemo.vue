<template>
  <div class="file-demo page-container">
    <el-card class="mb-20">
      <template #header>
        <div class="card-header">
          <span>{{ t('route.fileDemo') }} - {{ t('upload.componentDemo') }}</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane :label="t('upload.basicUpload')" name="basic">
          <div class="demo-block">
            <Upload
              v-model="basicFiles"
              :tip="t('upload.supportType', { type: 'jpg/png', size: '500kb' })"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane :label="t('upload.dragUpload')" name="drag">
          <div class="demo-block">
            <Upload v-model="dragFiles" drag multiple :tip="t('upload.dragTip')" />
          </div>
        </el-tab-pane>

        <el-tab-pane :label="t('upload.imageWall')" name="picture">
          <div class="demo-block">
            <Upload
              v-model="imageFiles"
              list-type="picture-card"
              accept="image/*"
              :tip="t('upload.imageTip')"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>{{ t('upload.resourceLibrary') }}</span>
          <el-button type="primary" :loading="loading" @click="fetchFileList">
            <el-icon class="mr-1"><div class="i-ep-refresh" /></el-icon>
            {{ t('upload.refresh') }}
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="resourceList" style="width: 100%">
        <el-table-column prop="name" :label="t('upload.fileName')" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center">
              <el-icon v-if="row.type.startsWith('image/')" class="mr-2"
                ><div class="i-ep-picture"
              /></el-icon>
              <el-icon v-else class="mr-2"><div class="i-ep-document" /></el-icon>
              <el-link :href="row.url" target="_blank" type="primary">{{ row.name }}</el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" :label="t('upload.fileType')" width="150" />
        <el-table-column prop="size" :label="t('upload.fileSize')" width="120">
          <template #default="{ row }">
            {{ formatSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="t('upload.createTime')" width="180" />
        <el-table-column :label="t('common.action')" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="handleDelete(row)">{{
              t('common.delete')
            }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import Upload from '@/components/Upload/index.vue'
import { fileApi, type FileItem } from '@/api/file'
import type { UploadUserFile } from 'element-plus'

const { t } = useI18n()

const activeTab = ref('basic')
const basicFiles = ref<UploadUserFile[]>([])
const dragFiles = ref<UploadUserFile[]>([])
const imageFiles = ref<UploadUserFile[]>([
  {
    name: 'food.jpeg',
    url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100',
  },
])

const loading = ref(false)
const resourceList = ref<FileItem[]>([])

const fetchFileList = async () => {
  loading.value = true
  try {
    const res = await fileApi.getFileList()
    resourceList.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleDelete = (row: FileItem) => {
  ElMessageBox.confirm(t('upload.deleteConfirm', { name: row.name }), t('common.warning'), {
    confirmButtonText: t('common.ok'),
    cancelButtonText: t('common.cancel'),
    type: 'warning',
  }).then(async () => {
    try {
      await fileApi.deleteFile(row.id)
      ElMessage.success(t('upload.deleteSuccess'))
      fetchFileList()
    } catch (error) {
      console.error(error)
    }
  })
}

const formatSize = (size: number) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  }
  return (size / 1024 / 1024).toFixed(2) + ' MB'
}

onMounted(() => {
  fetchFileList()
})
</script>

<style scoped>
.demo-block {
  padding: 20px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}
.flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
.mr-1 {
  margin-right: 4px;
}
.mr-2 {
  margin-right: 8px;
}
</style>
