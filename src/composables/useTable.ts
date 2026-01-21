import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export interface UseTableOptions<T> {
  fetchDataApi: (params?: any) => Promise<any>
  initialData?: T[]
  errorMessage?: string
  immediate?: boolean
  initialPageSize?: number
}

export function useTable<T = any>(options: UseTableOptions<T>) {
  const {
    fetchDataApi,
    initialData = [],
    errorMessage = '加载失败',
    immediate = true,
    initialPageSize = 10,
  } = options

  const loading = ref(false)
  const data = ref<T[]>(initialData)

  // 分页状态
  const pagination = reactive({
    currentPage: 1,
    pageSize: initialPageSize,
    total: 0,
  })

  const refresh = async () => {
    loading.value = true
    try {
      const res = await fetchDataApi({
        page: pagination.currentPage,
        limit: pagination.pageSize,
      })
      if (res.code === 200) {
        // 适配不同的返回结构
        if (res.data && Array.isArray(res.data.list)) {
          // 结构: { code: 200, data: { list: [], total: 100 } }
          data.value = res.data.list
          pagination.total = res.data.total
        } else if (Array.isArray(res.data)) {
          // 结构: { code: 200, data: [] } (无分页或隐式)
          data.value = res.data
          // 如果外层有 total 字段
          pagination.total = res.total || res.data.length
        } else {
          data.value = res.data
        }
      } else {
        throw new Error(res.message || errorMessage)
      }
    } catch (error: any) {
      console.error(error)
      ElMessage.error(error.message || errorMessage)
    } finally {
      loading.value = false
    }
  }

  const handleSizeChange = (val: number) => {
    pagination.pageSize = val
    refresh()
  }

  const handleCurrentChange = (val: number) => {
    pagination.currentPage = val
    refresh()
  }

  if (immediate) {
    refresh()
  }

  return {
    loading,
    data,
    pagination,
    refresh,
    handleSizeChange,
    handleCurrentChange,
  }
}
