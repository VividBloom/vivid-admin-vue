import { useTable, type UseTableOptions } from './useTable'
import { useDialog } from './useDialog'
import { ElMessage, ElMessageBox } from 'element-plus'

export interface UseCurdOptions<T> extends UseTableOptions<T> {
  createApi?: (data: any) => Promise<any>
  updateApi?: (data: any) => Promise<any>
  deleteApi?: (id: any) => Promise<any>
  itemName?: string
}

export function useCurd<T = any>(options: UseCurdOptions<T>) {
  const { createApi, updateApi, deleteApi, itemName = 'Item', ...tableOptions } = options

  const table = useTable(tableOptions)
  const dialog = useDialog()

  // Delete handler
  const handleDelete = async (row: any, confirmMessage?: string) => {
    if (!deleteApi) {
      console.warn('deleteApi is not provided')
      return
    }

    try {
      await ElMessageBox.confirm(
        confirmMessage || `Are you sure to delete this ${itemName}?`,
        'Confirm',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning',
        }
      )

      await deleteApi(row.id)
      ElMessage.success('Delete successfully')
      await table.refresh()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || 'Delete failed')
      }
    }
  }

  // Submit form handler
  const submitForm = async (formEl: any, formData: any, successMessage?: string) => {
    if (!formEl) return

    await formEl.validate(async (valid: boolean) => {
      if (!valid) return

      dialog.submitLoading.value = true
      try {
        if (dialog.isEdit.value) {
          if (updateApi) {
            await updateApi(formData)
            ElMessage.success(successMessage || 'Update successfully')
          }
        } else if (createApi) {
          await createApi(formData)
          ElMessage.success(successMessage || 'Create successfully')
        }
        dialog.closeDialog()
        await table.refresh()
      } catch (error: any) {
        ElMessage.error(error.message || 'Operation failed')
      } finally {
        dialog.submitLoading.value = false
      }
    })
  }

  return {
    ...table,
    ...dialog,
    handleDelete,
    submitForm,
  }
}
