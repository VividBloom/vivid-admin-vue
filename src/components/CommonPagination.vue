<template>
  <div class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      :layout="layout"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  pagination: {
    type: Object,
    required: true,
  },
  pageSizes: {
    type: Array as () => number[],
    default: () => [10, 20, 50, 100],
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper',
  },
})

const emit = defineEmits(['size-change', 'current-change', 'change'])

const currentPage = computed({
  get: () => props.pagination.currentPage,
  set: val => {
    // Modify the reactive object directly if possible, or emit event
    // Since useTable uses a reactive object, modifying it is fine,
    // but we also need to trigger the refresh via the event.
    // However, useTable's handleCurrentChange does both: update state and refresh.
    // So we should just emit the event and let the parent handle it.
    emit('current-change', val)
  },
})

const pageSize = computed({
  get: () => props.pagination.pageSize,
  set: val => {
    emit('size-change', val)
  },
})

const total = computed(() => props.pagination.total)

const handleSizeChange = (val: number) => {
  emit('size-change', val)
}

const handleCurrentChange = (val: number) => {
  emit('current-change', val)
}
</script>

<style scoped>
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
