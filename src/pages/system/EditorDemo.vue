<template>
  <div class="editor-demo p-4">
    <el-card shadow="never" header="富文本编辑器示例">
      <div class="mb-4">
        <el-alert
          title="基于 wangEditor 封装的通用组件"
          type="info"
          show-icon
          :closable="false"
        />
      </div>

      <div class="mb-4">
        <el-radio-group v-model="mode" class="mb-4">
          <el-radio-button label="default">默认模式</el-radio-button>
          <el-radio-button label="simple">简洁模式</el-radio-button>
        </el-radio-group>
        <el-button class="ml-4" @click="disabled = !disabled">
          {{ disabled ? '启用' : '禁用' }}
        </el-button>
      </div>

      <Editor v-model="content" :mode="mode" :disabled="disabled" placeholder="请输入内容..." />

      <div class="mt-4">
        <h3>内容预览 (HTML):</h3>
        <el-input
          v-model="content"
          type="textarea"
          :rows="5"
          readonly
          placeholder="编辑器内容将同步显示在这里"
        />
      </div>

      <div class="mt-4" v-html="content"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Editor from '@/components/Editor/index.vue' // 手动导入，或者依靠自动导入

const content = ref('<p>Hello <b>Vue3 Admin</b>!</p>')
const mode = ref<'default' | 'simple'>('default')
const disabled = ref(false)
</script>

<style scoped>
.editor-demo {
  height: 100%;
}
</style>
