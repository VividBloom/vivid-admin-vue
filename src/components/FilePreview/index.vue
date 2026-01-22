<template>
  <el-dialog
    v-model="visible"
    :title="file?.name || t('preview.title')"
    width="80%"
    top="5vh"
    destroy-on-close
    class="file-preview-dialog"
    :fullscreen="fullscreen"
    :show-close="false"
    :draggable="!fullscreen"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="my-header flex justify-between items-center">
        <h4 :id="titleId" :class="titleClass">{{ file?.name || t('preview.title') }}</h4>
        <div class="flex items-center gap-2">
          <!-- Zoom Controls for Office/PDF -->
          <div
            v-if="['word', 'excel', 'ppt', 'pdf'].includes(fileType)"
            class="flex items-center gap-1 mr-4 border-r pr-4"
          >
            <el-button circle size="small" @click="handleZoom(-0.1)">
              <el-icon><div class="i-ep-minus" /></el-icon>
            </el-button>
            <span class="text-sm w-12 text-center">{{ Math.round(scale * 100) }}%</span>
            <el-button circle size="small" @click="handleZoom(0.1)">
              <el-icon><div class="i-ep-plus" /></el-icon>
            </el-button>
            <el-button circle size="small" @click="scale = 1">
              <el-icon><div class="i-ep-refresh-right" /></el-icon>
            </el-button>
          </div>

          <el-button link @click="toggleFullscreen">
            <el-icon>
              <div :class="fullscreen ? 'i-ep-copy-document' : 'i-ep-full-screen'" />
            </el-icon>
          </el-button>
          <el-button link @click="close">
            <el-icon><div class="i-ep-close" /></el-icon>
          </el-button>
        </div>
      </div>
    </template>

    <div ref="previewContainer" v-loading="loading" class="preview-container">
      <!-- Image -->
      <div v-if="fileType === 'image'" class="h-full flex justify-center items-center bg-gray-100">
        <el-image
          :src="file?.url"
          fit="contain"
          class="max-h-full max-w-full"
          :style="{ transform: `scale(${scale})`, transition: 'transform 0.2s' }"
        />
      </div>

      <!-- Word -->
      <div
        v-else-if="fileType === 'word'"
        class="office-wrapper w-full h-full overflow-auto bg-gray-100 flex justify-center"
      >
        <VueOfficeDocx
          :src="file?.url"
          class="docx-container shadow-lg"
          :style="{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            width: '800px', // Fixed width base for better scaling
            minHeight: '100%',
          }"
          @rendered="onRendered"
          @error="onError"
        />
      </div>

      <!-- Excel -->
      <div
        v-else-if="fileType === 'excel'"
        class="office-wrapper w-full h-full overflow-auto bg-gray-100"
      >
        <VueOfficeExcel
          :src="file?.url"
          class="excel-container"
          :style="{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }"
          @rendered="onRendered"
          @error="onError"
        />
      </div>

      <!-- PDF -->
      <div
        v-else-if="fileType === 'pdf'"
        class="office-wrapper w-full h-full overflow-auto bg-gray-100 flex justify-center"
      >
        <VueOfficePdf
          :src="file?.url"
          class="pdf-container shadow-lg"
          :style="{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            width: '800px',
          }"
          @rendered="onRendered"
          @error="onError"
        />
      </div>

      <!-- PPT -->
      <div
        v-else-if="fileType === 'ppt'"
        class="office-wrapper w-full h-full overflow-auto bg-gray-100 flex justify-center"
      >
        <VueOfficePptx
          :src="file?.url"
          class="ppt-container shadow-lg"
          :style="{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            width: '100%',
          }"
          @rendered="onRendered"
          @error="onError"
        />
      </div>

      <!-- EPUB -->
      <EpubViewer v-else-if="fileType === 'epub'" :url="file?.url || ''" class="epub-container" />

      <!-- XMind -->
      <div
        v-else-if="fileType === 'xmind'"
        id="xmind-container"
        ref="xmindContainer"
        class="xmind-container"
      ></div>

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
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
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
import MindMap from 'simple-mind-map'
import 'simple-mind-map/dist/simpleMindMap.esm.css'
// @ts-ignore
import xmind from 'simple-mind-map/src/parse/xmind.js'
import { useUserStore } from '@/stores/user'
import { useWatermark } from '@/composables/useWatermark'
import EpubViewer from './EpubViewer.vue'

const { t } = useI18n()
const userStore = useUserStore()

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
const previewContainer = ref<HTMLElement | null>(null)
const scale = ref(1.0)

const handleZoom = (delta: number) => {
  const newScale = scale.value + delta
  if (newScale >= 0.1 && newScale <= 3.0) {
    scale.value = Number(newScale.toFixed(1))
  }
}

const { setWatermark, clear } = useWatermark(previewContainer, 'file-preview-watermark')

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
  if (/\.(xmind)$/.test(name)) return 'xmind'
  return 'unknown'
})

const onRendered = () => {
  loading.value = false
}

const onError = (e: any) => {
  console.error('Preview error:', e)
  loading.value = false
}

// XMind Handling
let mindMap: any = null

const renderXmind = async () => {
  if (!props.file?.url) return
  loading.value = true
  try {
    const response = await fetch(props.file.url)
    const arrayBuffer = await response.arrayBuffer()
    const data = await xmind.parseXmindFile(arrayBuffer)

    nextTick(() => {
      if (mindMap) {
        mindMap.destroy()
        mindMap = null
      }
      const el = document.getElementById('xmind-container')
      if (el) {
        el.innerHTML = ''
        mindMap = new MindMap({
          el,
          data,
          readonly: true,
          theme: 'default',
        } as any)
        loading.value = false
      }
    })
  } catch (e) {
    onError(e)
  }
}

onUnmounted(() => {
  if (mindMap) {
    mindMap.destroy()
    mindMap = null
  }
})

watch(
  () => [props.modelValue, props.file],
  ([val, file]) => {
    if (val && file) {
      loading.value = true
      scale.value = 1.0

      // Set watermark
      nextTick(() => {
        const username = userStore.userInfo?.username || 'Guest'
        setWatermark(`${username} - ${t('preview.title')}`)
      })

      if (fileType.value === 'epub') {
        loading.value = false
      } else if (fileType.value === 'xmind') {
        renderXmind()
      } else if (fileType.value === 'image') {
        loading.value = false
      }
      // Other types handle loading via events
    } else {
      clear()
      if (mindMap) {
        mindMap.destroy()
        mindMap = null
      }
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
.epub-container,
.xmind-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
}
</style>
