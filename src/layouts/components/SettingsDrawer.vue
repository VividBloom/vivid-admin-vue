<template>
  <el-drawer v-model="drawerVisible" :title="$t('settings.title')" direction="rtl" size="300px">
    <div class="settings-container">
      <!-- 主题设置 -->
      <el-divider>{{ $t('settings.theme') }}</el-divider>
      <div class="setting-item">
        <span>{{ $t('settings.dark') }}</span>
        <el-switch
          v-model="isDark"
          inline-prompt
          @change="(val: string | number | boolean) => toggleDark(Boolean(val))"
        >
          <template #active-icon>
            <div class="i-ep-moon" />
          </template>
          <template #inactive-icon>
            <div class="i-ep-sunny" />
          </template>
        </el-switch>
      </div>

      <!-- 语言设置 -->
      <el-divider>{{ $t('settings.language') }}</el-divider>
      <div class="setting-item">
        <span>{{ $t('settings.language') }}</span>
        <el-select v-model="language" style="width: 120px" @change="handleLanguageChange">
          <el-option :label="$t('settings.zh')" value="zh-cn" />
          <el-option :label="$t('settings.en')" value="en" />
        </el-select>
      </div>

      <!-- 布局设置 -->
      <el-divider>{{ $t('settings.layout') }}</el-divider>
      <div class="setting-item">
        <span>{{ $t('settings.sidebar') }}</span>
        <el-switch v-model="sidebarCollapsed" @change="toggleSidebar" />
      </div>
      <div class="setting-item">
        <span>{{ $t('settings.tagsView') }}</span>
        <el-switch v-model="settings.showTagsView" />
      </div>
      <div class="setting-item">
        <span>{{ $t('settings.logo') }}</span>
        <el-switch v-model="settings.showLogo" />
      </div>
      <div class="setting-item">
        <span>{{ $t('settings.breadcrumb') }}</span>
        <el-switch v-model="settings.showBreadcrumb" />
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const appStore = useAppStore()
const { isDark, sidebarCollapsed, language, settings } = storeToRefs(appStore)
const { toggleDark, toggleSidebar, setLanguage } = appStore

const drawerVisible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const handleLanguageChange = (val: string) => {
  setLanguage(val)
}
</script>

<style scoped lang="scss">
.settings-container {
  padding: 0 10px;

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 14px;
    color: var(--el-text-color-primary);
  }
}
</style>
