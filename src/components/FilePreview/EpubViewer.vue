<template>
  <div
    class="epub-viewer h-full flex flex-col relative bg-gray-50"
    :style="{ backgroundColor: containerBackground }"
  >
    <!-- Top Toolbar -->
    <div
      class="epub-toolbar h-12 flex justify-between items-center px-4 bg-white border-b shadow-sm z-10"
      :class="{ 'dark-toolbar': theme === 'dark' }"
    >
      <div class="flex items-center gap-2">
        <el-button text @click="showToc = true">
          <el-icon class="mr-1"><div class="i-ep-list" /></el-icon>
          {{ t('epub.toc') }}
        </el-button>
      </div>

      <div class="flex items-center gap-4">
        <!-- Font Size -->
        <div class="flex items-center gap-1">
          <el-button circle size="small" @click="changeFontSize(-2)">
            <el-icon><div class="i-ep-minus" /></el-icon>
          </el-button>
          <span class="text-sm w-12 text-center">{{ fontSize }}%</span>
          <el-button circle size="small" @click="changeFontSize(2)">
            <el-icon><div class="i-ep-plus" /></el-icon>
          </el-button>
        </div>

        <!-- Theme -->
        <el-dropdown @command="setTheme">
          <el-button text>
            {{ currentThemeLabel }}
            <el-icon class="el-icon--right"><div class="i-ep-arrow-down" /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="light">{{ t('epub.theme.light') }}</el-dropdown-item>
              <el-dropdown-item command="dark">{{ t('epub.theme.dark') }}</el-dropdown-item>
              <el-dropdown-item command="sepia">{{ t('epub.theme.sepia') }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 relative overflow-hidden">
      <div id="epub-render-area" class="w-full h-full"></div>

      <!-- Loading Indicator -->
      <div
        v-if="loading"
        class="absolute inset-0 flex justify-center items-center bg-white bg-opacity-80 z-20"
      >
        <el-icon class="is-loading" :size="32"><div class="i-ep-loading" /></el-icon>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <div
      class="epub-footer h-12 flex justify-between items-center px-4 bg-white border-t z-10"
      :class="{ 'dark-footer': theme === 'dark' }"
    >
      <el-button :disabled="!bookReady" @click="prevPage">
        {{ t('epub.prev') }}
      </el-button>

      <div class="flex-1 mx-4 flex items-center gap-2">
        <span class="text-xs text-gray-500 whitespace-nowrap">{{ currentChapterName }}</span>
        <!-- Progress Bar (Approximate) -->
        <el-slider
          v-model="progress"
          :min="0"
          :max="100"
          :step="1"
          :show-tooltip="false"
          :disabled="!locationsReady"
          @change="onProgressChange"
        />
        <span class="text-xs text-gray-500 w-10 text-right">{{ progress }}%</span>
      </div>

      <el-button :disabled="!bookReady" @click="nextPage">
        {{ t('epub.next') }}
      </el-button>
    </div>

    <!-- TOC Drawer -->
    <el-drawer
      v-model="showToc"
      :title="t('epub.toc')"
      direction="ltr"
      size="300px"
      :modal="true"
      append-to-body
    >
      <div class="toc-list">
        <div
          v-for="(item, index) in toc"
          :key="index"
          class="toc-item py-2 px-2 cursor-pointer hover:bg-gray-100 text-sm truncate"
          :class="{ 'text-primary font-bold': currentChapterHref === item.href }"
          :title="item.label"
          @click="jumpTo(item.href)"
        >
          {{ item.label }}
        </div>
        <div v-if="toc.length === 0" class="text-center text-gray-400 mt-4">
          {{ t('epub.noToc') }}
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { useI18n } from 'vue-i18n'
// @ts-ignore
import ePub from 'epubjs'

const props = defineProps<{
  url: string
}>()

const { t } = useI18n()

// State
const loading = ref(true)
const bookReady = ref(false)
const locationsReady = ref(false)
const showToc = ref(false)
const toc = ref<any[]>([])
const fontSize = ref(100)
const theme = ref('light')
const progress = ref(0)
const currentChapterName = ref('')
const currentChapterHref = ref('')
const containerBackground = ref('#ffffff')

// Epub instances
let book: any = null
let rendition: any = null

// Constants
const STORAGE_KEY_PREFIX = 'epub-progress-'

// Computed
const currentThemeLabel = computed(() => {
  const map: Record<string, string> = {
    light: t('epub.theme.light'),
    dark: t('epub.theme.dark'),
    sepia: t('epub.theme.sepia'),
  }
  return map[theme.value] || theme.value
})

// Theme Definitions moved outside to avoid duplication
const THEMES = {
  light: {
    body: { 'background-color': '#ffffff !important', color: '#000000 !important' },
    'p, div, span, h1, h2, h3, h4, h5, h6, li, blockquote, pre, td, th': {
      color: '#000000 !important',
      'background-color': 'transparent !important',
    },
    a: { color: '#0000ee !important' },
  },
  dark: {
    body: { 'background-color': '#1a1a1a !important', color: '#cfcfcf !important' },
    'p, div, span, h1, h2, h3, h4, h5, h6, li, blockquote, pre, td, th': {
      color: 'inherit !important',
      'background-color': 'transparent !important',
    },
    'a, a *': { color: '#3b82f6 !important', 'background-color': 'transparent !important' },
    img: { opacity: '0.8 !important', filter: 'brightness(0.8) !important' },
    hr: { 'border-color': '#444 !important' },
  },
  sepia: {
    body: { 'background-color': '#f6f1d1 !important', color: '#5f4b32 !important' },
    'p, div, span, h1, h2, h3, h4, h5, h6, li, blockquote, pre, td, th': {
      color: '#5f4b32 !important',
      'background-color': 'transparent !important',
    },
    a: { color: '#0000ee !important' },
  },
}

// Methods
const objectToCss = (obj: Record<string, any>) => {
  let css = ''
  for (const selector in obj) {
    css += `${selector} {`
    for (const prop in obj[selector]) {
      css += `${prop}: ${obj[selector][prop]}; `
    }
    css += '} '
  }
  return css
}

const applyThemeToContents = (contents: any, themeName: string) => {
  const themeObj = (THEMES as any)[themeName]
  if (!themeObj) return

  const doc = contents.document
  if (!doc) return

  let styleEl = doc.getElementById('epub-viewer-custom-theme')
  if (!styleEl) {
    styleEl = doc.createElement('style')
    styleEl.id = 'epub-viewer-custom-theme'
    doc.head.appendChild(styleEl)
  }
  styleEl.textContent = objectToCss(themeObj)
}

const initBook = () => {
  if (!props.url) return

  // Cleanup if exists
  if (book) {
    book.destroy()
  }

  loading.value = true
  book = ePub(props.url)

  // Render
  nextTick(() => {
    rendition = book.renderTo('epub-render-area', {
      width: '100%',
      height: '100%',
      flow: 'paginated',
      manager: 'default',
      // allowScriptedContent: true
    })

    // Register Themes - just register empty objects to allow selection without auto-injection
    // We handle injection manually via applyThemeToContents to avoid style stacking
    // @ts-ignore
    rendition.themes.register('light', {})
    // @ts-ignore
    rendition.themes.register('dark', {})
    // @ts-ignore
    rendition.themes.register('sepia', {})

    // Content Hook to force styles
    rendition.hooks.content.register((contents: any) => {
      applyThemeToContents(contents, theme.value)
    })

    // Select default theme
    setTheme('light')

    // Display
    const savedLocation = localStorage.getItem(STORAGE_KEY_PREFIX + props.url)
    const displayPromise = savedLocation ? rendition.display(savedLocation) : rendition.display()

    displayPromise
      .then(() => {
        loading.value = false
        bookReady.value = true
        initEvents()
        loadToc()
        // Generate locations for progress bar (async)
        book.locations.generate(1000).then(() => {
          locationsReady.value = true
          updateProgress()
        })
      })
      .catch((err: any) => {
        console.error('EPUB render error:', err)
        loading.value = false
      })
  })
}

const initEvents = () => {
  if (!rendition) return

  // Relocated event (page turn)
  rendition.on('relocated', (location: any) => {
    // Save location
    localStorage.setItem(STORAGE_KEY_PREFIX + props.url, location.start.cfi)

    // Update progress
    updateProgress(location)

    // Update Chapter Name
    updateCurrentChapter(location)
  })
}

const loadToc = async () => {
  const navigation = await book.loaded.navigation
  toc.value = flattenToc(navigation.toc)
}

const flattenToc = (items: any[]): any[] => {
  let result: any[] = []
  items.forEach(item => {
    result.push({ label: item.label, href: item.href })
    if (item.subitems && item.subitems.length > 0) {
      result = result.concat(flattenToc(item.subitems))
    }
  })
  return result
}

const updateProgress = (location?: any) => {
  if (!locationsReady.value) return
  const loc = location || rendition.currentLocation()
  if (loc && loc.start) {
    const percentage = book.locations.percentageFromCfi(loc.start.cfi)
    progress.value = Math.floor(percentage * 100)
  }
}

const updateCurrentChapter = (location: any) => {
  if (!location || !location.start) return
  const href = location.start.href
  const chapter = toc.value.find(item => href.includes(item.href) || item.href.includes(href))
  if (chapter) {
    currentChapterName.value = chapter.label
    currentChapterHref.value = chapter.href
  }
}

const prevPage = () => {
  if (rendition) rendition.prev()
}

const nextPage = () => {
  if (rendition) rendition.next()
}

const jumpTo = (href: string) => {
  if (rendition) {
    rendition.display(href)
    showToc.value = false
  }
}

const changeFontSize = (delta: number) => {
  fontSize.value += delta
  if (fontSize.value < 50) fontSize.value = 50
  if (fontSize.value > 200) fontSize.value = 200
  if (rendition) {
    rendition.themes.fontSize(fontSize.value + '%')
  }
}

const setTheme = (themeName: string) => {
  theme.value = themeName

  // Update container background to match theme
  const bgMap: Record<string, string> = {
    light: '#ffffff',
    dark: '#1a1a1a',
    sepia: '#f6f1d1',
  }
  containerBackground.value = bgMap[themeName] || '#ffffff'

  if (rendition) {
    rendition.themes.select(themeName)

    // Force update on existing contents
    if (rendition.getContents) {
      // @ts-ignore
      rendition.getContents().forEach((contents: any) => {
        applyThemeToContents(contents, themeName)
      })
    }

    // Trigger resize and reload current page to ensure theme application
    nextTick(() => {
      rendition.resize()
      const currentLoc = rendition.currentLocation()
      if (currentLoc && currentLoc.start) {
        rendition.display(currentLoc.start.cfi)
      }
    })
  }
}

const onProgressChange = (val: number | number[]) => {
  if (Array.isArray(val)) return
  if (book && locationsReady.value) {
    const cfi = book.locations.cfiFromPercentage(val / 100)
    if (cfi) rendition.display(cfi)
  }
}

onMounted(() => {
  initBook()
})

onUnmounted(() => {
  if (book) {
    book.destroy()
  }
})

watch(
  () => props.url,
  () => {
    initBook()
  }
)
</script>

<style scoped>
.epub-viewer {
  transition: background-color 0.3s;
}
:deep(.el-drawer__body) {
  padding: 0;
}
.toc-list {
  padding: 10px;
}
.toc-item {
  border-radius: 4px;
  transition: background-color 0.2s;
}

/* Dark mode overrides for toolbar/footer if needed */
.dark-toolbar {
  background-color: #2c2c2c !important;
  border-bottom-color: #444 !important;
  color: #cfcfcf;
}
.dark-toolbar :deep(.el-button) {
  color: #cfcfcf;
}
.dark-toolbar :deep(.el-button:hover) {
  background-color: #3c3c3c;
}

.dark-footer {
  background-color: #2c2c2c !important;
  border-top-color: #444 !important;
  color: #cfcfcf;
}
.dark-footer :deep(.el-button) {
  color: #cfcfcf;
}
.dark-footer :deep(.text-gray-500) {
  color: #9ca3af;
}
</style>
