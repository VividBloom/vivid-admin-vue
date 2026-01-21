import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dictApi } from '@/api'
import type { DictItem } from '@/api/dictionary'

export const useDictStore = defineStore('dict', () => {
  const dictCache = ref<Record<string, DictItem[]>>({})
  const loading = ref<Record<string, boolean>>({})

  const fetchDict = async (code: string) => {
    if (dictCache.value[code]) return dictCache.value[code]
    if (loading.value[code]) return [] // Avoid duplicate requests

    loading.value[code] = true
    try {
      const res = await dictApi.getDictItems(code)
      if (res.code === 200) {
        dictCache.value[code] = res.data
      }
    } catch (error) {
      console.error(`Failed to fetch dictionary: ${code}`, error)
    } finally {
      loading.value[code] = false
    }
    return dictCache.value[code] || []
  }

  const getDict = (code: string) => {
    if (!dictCache.value[code] && !loading.value[code]) {
      fetchDict(code)
    }
    return dictCache.value[code] || []
  }

  // Clean cache for a specific code (e.g. after update)
  const clearCache = (code: string) => {
    delete dictCache.value[code]
  }

  const getLabel = (code: string, value: string | number) => {
    const items = dictCache.value[code]
    if (!items) return value
    const item = items.find(item => item.value === String(value))
    return item ? item.label : value
  }

  return {
    dictCache,
    fetchDict,
    getDict,
    clearCache,
    getLabel,
  }
})
