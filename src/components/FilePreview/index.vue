<template>
  <el-dialog
    v-model="visible"
    :title="file?.name || t('preview.title')"
    width="80%"
    top="5vh"
    destroy-on-close
    class="file-preview-dialog"
    :fullscreen="fullscreen"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="my-header flex justify-between items-center">
        <h4 :id="titleId" :class="titleClass">{{ file?.name || t('preview.title') }}</h4>
        <div class="flex items-center gap-2">
          <el-button link @click="toggleFullscreen">
            <el-icon>
              <div :class="fullscreen ? 'i-ep-full-screen' : 'i-ep-full-screen'" />
            </el-icon>
          </el-button>
          <el-button link @click="close">
            <el-icon><div class="i-ep-close" /></el-icon>
          </el-button>
        </div>
      </div>
    </template>

    <div v-loading="loading" class="preview-container">
      <!-- Image -->
      <div v-if="fileType === 'image'" class="h-full flex justify-center items-center bg-gray-100">
        <el-image :src="file?.url" fit="contain" class="max-h-full max-w-full" />
      </div>

      <!-- Word -->
      <VueOfficeDocx
        v-else-if="fileType === 'word'"
        :src="file?.url"
        class="docx-container"
        @rendered="onRendered"
        @error="onError"
      />

      <!-- Excel -->
      <VueOfficeExcel
        v-else-if="fileType === 'excel'"
        :src="file?.url"
        class="excel-container"
        @rendered="onRendered"
        @error="onError"
      />

      <!-- PDF -->
      <VueOfficePdf
        v-else-if="fileType === 'pdf'"
        :src="file?.url"
        class="pdf-container"
        @rendered="onRendered"
        @error="onError"
      />

      <!-- PPT -->
      <VueOfficePptx
        v-else-if="fileType === 'ppt'"
        :src="file?.url"
        class="ppt-container"
        @rendered="onRendered"
        @error="onError"
      />

      <!-- EPUB -->
      <div v-else-if="fileType === 'epub'" id="epub-area" class="epub-container"></div>

      <!-- Unsupported -->
      <div v-else class="h-full flex flex-col justify-center items-center text-gray-400">
        <el-icon :size="64"><div class="i-ep-document-delete" /></el-icon>
        <p class="mt-4">{{ t('preview.unsupported') }}</p>
        <el-button type="primary" link :href="file?.url" target="_blank" class="mt-2">
          {{ t('preview.download') }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
// @ts-ignore
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'
// @ts-ignore
import VueOfficeExcel from '@vue-office/excel'
import '@vue-office/excel/lib/index.css'
// @ts-ignore
import VueOfficePdf from '@vue-office/pdf'
// @ts-ignore
import VueOfficePptx from '@vue-office/pptx'
// @ts-ignore
import ePub from 'epubjs'

const { t } = useI18n()

interface Props {
  modelValue: boolean
  file: {
    name: string
    url: string
    type?: string
  } | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const loading = ref(false)
const fullscreen = ref(false)

const toggleFullscreen = () => {
  fullscreen.value = !fullscreen.value
}

const fileType = computed(() => {
  if (!props.file) return ''
  const name = props.file.name.toLowerCase()
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(name)) return 'image'
  if (/\.(docx|doc)$/.test(name)) return 'word'
  if (/\.(xlsx|xls)$/.test(name)) return 'excel'
  if (/\.(pdf)$/.test(name)) return 'pdf'
  if (/\.(pptx|ppt)$/.test(name)) return 'ppt'
  if (/\.(epub)$/.test(name)) return 'epub'
  return 'unknown'
})

const onRendered = () => {
  loading.value = false
}

const onError = (e: any) => {
  console.error('Preview error:', e)
  loading.value = false
}

// EPUB Handling
let book: any = null
let rendition: any = null

const renderEpub = () => {
  if (!props.file?.url) return
  loading.value = true
  nextTick(() => {
    const area = document.getElementById('epub-area')
    if (area && props.file) {
      area.innerHTML = '' // Clear previous
      book = ePub(props.file.url)
      rendition = book.renderTo('epub-area', {
        width: '100%',
        height: '100%',
        flow: 'scrolled-doc',
      })
      rendition
        .display()
        .then(() => {
          loading.value = false
        })
        .catch((err: any) => {
          console.error(err)
          loading.value = false
        })
    }
  })
}

watch(
  () => [props.modelValue, props.file],
  ([val, file]) => {
    if (val && file) {
      loading.value = true
      if (fileType.value === 'epub') {
        renderEpub()
      } else if (fileType.value === 'image') {
        loading.value = false
      }
      // Other types handle loading via events
    }
  }
)
</script>

<style scoped>
.preview-container {
  height: 70vh;
  overflow: auto;
  background-color: #f5f7fa;
}

.file-preview-dialog.is-fullscreen .preview-container {
  height: calc(100vh - 60px);
}

.docx-container,
.excel-container,
.pdf-container,
.ppt-container,
.epub-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
}
</style>
