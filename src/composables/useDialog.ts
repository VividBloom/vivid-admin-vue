import { ref } from 'vue'

export function useDialog() {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitLoading = ref(false)

  const openCreate = () => {
    isEdit.value = false
    visible.value = true
  }

  const openEdit = () => {
    isEdit.value = true
    visible.value = true
  }

  const closeDialog = () => {
    visible.value = false
  }

  const show = () => {
    visible.value = true
  }

  const hide = () => {
    visible.value = false
  }

  return {
    visible,
    isEdit,
    submitLoading,
    openCreate,
    openEdit,
    closeDialog,
    show,
    hide,
  }
}
