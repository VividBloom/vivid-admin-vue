<template>
  <div class="upload-component">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="action"
      :headers="headers"
      :multiple="multiple"
      :limit="limit"
      :drag="drag"
      :accept="accept"
      :list-type="listType"
      :disabled="disabled"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-exceed="handleExceed"
      :before-upload="beforeUpload"
      class="upload-content"
    >
      <template v-if="drag">
        <el-icon class="el-icon--upload"><div class="i-ep-upload-filled" /></el-icon>
        <div class="el-upload__text">
          {{ t('upload.dragText') }} <em>{{ t('upload.clickUpload') }}</em>
        </div>
      </template>
      <template v-else>
        <template v-if="listType === 'picture-card'">
          <el-icon><div class="i-ep-plus" /></el-icon>
        </template>
        <el-button v-else type="primary">
          <el-icon class="mr-1"><div class="i-ep-upload" /></el-icon>
          {{ t('upload.clickUpload') }}
        </el-button>
      </template>
      <template #tip>
        <div v-if="tip" class="el-upload__tip">
          {{ tip }}
        </div>
      </template>
    </el-upload>

    <el-dialog v-model="dialogVisible" append-to-body>
      <img w-full :src="dialogImageUrl" alt="Preview Image" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import type { UploadInstance, UploadProps, UploadUserFile } from 'element-plus'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const userStore = useUserStore()

interface Props {
  modelValue?: UploadUserFile[]
  action?: string
  multiple?: boolean
  limit?: number
  drag?: boolean
  accept?: string
  listType?: 'text' | 'picture' | 'picture-card'
  disabled?: boolean
  tip?: string
  maxSize?: number // MB
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  action: '/api/file/upload',
  multiple: false,
  limit: 10,
  drag: false,
  accept: '',
  listType: 'text',
  disabled: false,
  tip: '',
  maxSize: 10,
})

const emit = defineEmits(['update:modelValue', 'success', 'error', 'remove', 'exceed'])

const uploadRef = ref<UploadInstance>()
const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const fileList = ref<UploadUserFile[]>([])

// Sync props.modelValue to fileList
watch(
  () => props.modelValue,
  val => {
    fileList.value = val
  },
  { immediate: true, deep: true }
)

// Sync fileList to props.modelValue
watch(
  fileList,
  val => {
    emit('update:modelValue', val)
  },
  { deep: true }
)

const headers = computed(() => {
  return {
    Authorization: `Bearer ${userStore.token}`,
  }
})

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  emit('remove', uploadFile, uploadFiles)
}

const handlePreview: UploadProps['onPreview'] = file => {
  if (file.url) {
    dialogImageUrl.value = file.url
    dialogVisible.value = true
  }
}

const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
  ElMessage.warning(
    t('upload.exceedLimit', {
      limit: props.limit,
      selected: files.length,
      total: files.length + uploadFiles.length,
    })
  )
  emit('exceed', files, uploadFiles)
}

const beforeUpload: UploadProps['beforeUpload'] = rawFile => {
  if (props.maxSize && rawFile.size / 1024 / 1024 > props.maxSize) {
    ElMessage.error(t('upload.maxSize', { size: props.maxSize }))
    return false
  }
  return true
}

const handleSuccess: UploadProps['onSuccess'] = (response, uploadFile, uploadFiles) => {
  // Update file url from response if needed
  if (response.success && response.data) {
    uploadFile.url = response.data.url
    uploadFile.name = response.data.name
    // You might want to store the ID or other metadata
  }
  emit('success', response, uploadFile, uploadFiles)
}

const handleError: UploadProps['onError'] = (error, uploadFile, uploadFiles) => {
  ElMessage.error(t('upload.error'))
  emit('error', error, uploadFile, uploadFiles)
}
</script>

<style scoped>
.upload-component {
  width: 100%;
}
.mr-1 {
  margin-right: 4px;
}
</style>
