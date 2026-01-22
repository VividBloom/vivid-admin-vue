<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :default-config="toolbarConfig"
      :mode="mode"
    />
    <Editor
      v-model="valueHtml"
      style="height: 500px; overflow-y: hidden"
      :default-config="editorConfig"
      :mode="mode"
      @on-created="handleCreated"
      @on-change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { onBeforeUnmount, ref, shallowRef, watch, computed } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

// Props
interface Props {
  modelValue?: string
  mode?: 'default' | 'simple'
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  mode: 'default',
  placeholder: '请输入内容...',
  disabled: false,
})

// Emits
const emit = defineEmits(['update:modelValue', 'change', 'created'])

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref(props.modelValue)

// 监听 props.modelValue 变化，同步到 valueHtml
watch(
  () => props.modelValue,
  val => {
    if (val !== valueHtml.value) {
      valueHtml.value = val
    }
  }
)

// 监听 props.disabled
watch(
  () => props.disabled,
  val => {
    const editor = editorRef.value
    if (editor === null) {
      return
    }
    if (val) {
      editor.disable()
    } else {
      editor.enable()
    }
  }
)

// 工具栏配置
const toolbarConfig: Partial<IToolbarConfig> = {}

// 编辑器配置
const editorConfig: Partial<IEditorConfig> = {
  placeholder: props.placeholder,
  readOnly: props.disabled,
  MENU_CONF: {
    uploadImage: {
      // server: '/api/upload', // 上传图片地址
      // fieldName: 'file',
      // maxFileSize: 10 * 1024 * 1024, // 10M
      // base64LimitSize: 5 * 1024, // 5kb 以下插入 base64
      // onBeforeUpload(file: File) {
      //   return file
      // },
      // onProgress(progress: number) {
      //   console.log('progress', progress)
      // },
      // onSuccess(file: File, res: any) {
      //   console.log(`${file.name} 上传成功`, res)
      // },
      // onFailed(file: File, res: any) {
      //   console.log(`${file.name} 上传失败`, res)
      // },
      // onError(file: File, err: any, res: any) {
      //   console.log(`${file.name} 上传出错`, err, res)
      // },
    },
  },
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor === null) {
    return
  }
  editor.destroy()
})

const handleCreated = (editor: any) => {
  editorRef.value = editor // 记录 editor 实例，重要！
  if (props.disabled) {
    editor.disable()
  }
  emit('created', editor)
}

const handleChange = (editor: any) => {
  emit('update:modelValue', editor.getHtml())
  emit('change', editor.getHtml())
}
</script>

<style scoped>
/* 可以在这里覆盖 wangEditor 的样式 */
</style>
