<template>
  <div class="audit-log">
    <div class="page-header">
      <h2>{{ $t('log.title') }}</h2>
    </div>

    <el-card class="content-card" shadow="never">
      <!-- 搜索栏 -->
      <div class="search-bar mb-4">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item :label="$t('log.username')">
            <el-input
              v-model="searchForm.username"
              :placeholder="$t('log.enterUsername')"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item :label="$t('log.module')">
            <el-select
              v-model="searchForm.module"
              :placeholder="$t('log.selectModule')"
              clearable
              style="width: 180px"
            >
              <el-option label="User Management" value="User Management" />
              <el-option label="Role Management" value="Role Management" />
              <el-option label="System Settings" value="System Settings" />
              <el-option label="Permission Management" value="Permission Management" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('log.status')">
            <el-select
              v-model="searchForm.status"
              :placeholder="$t('log.selectStatus')"
              clearable
              style="width: 120px"
            >
              <el-option :label="$t('log.success')" value="success" />
              <el-option :label="$t('log.fail')" value="fail" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('app.search') }}</el-button>
            <el-button @click="handleReset">{{ $t('app.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="logList" style="width: 100%" border>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" :label="$t('log.username')" min-width="120" />
        <el-table-column prop="module" :label="$t('log.module')" min-width="150" />
        <el-table-column prop="action" :label="$t('log.action')" width="120">
          <template #default="{ row }">
            <el-tag :type="getActionType(row.action)">{{ row.action }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" :label="$t('log.ip')" width="140" />
        <el-table-column prop="status" :label="$t('log.status')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? $t('log.success') : $t('log.fail') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('log.createTime')" width="180" />
        <el-table-column
          prop="details"
          :label="$t('log.details')"
          min-width="200"
          show-overflow-tooltip
        />
      </el-table>

      <!-- 分页 -->
      <CommonPagination
        :pagination="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useCurd } from '@/composables/useCurd'
import CommonPagination from '@/components/CommonPagination.vue'
import { logApi } from '@/api/log'

// 搜索表单
const searchForm = reactive({
  username: '',
  module: '',
  status: '',
})

// 使用 useCurd
const {
  loading,
  data: logList,
  pagination,
  refresh,
  handleSizeChange,
  handleCurrentChange,
} = useCurd({
  fetchDataApi: params => logApi.getLogs({ ...params, ...searchForm }),
})

const handleSearch = () => {
  pagination.currentPage = 1
  refresh()
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.module = ''
  searchForm.status = ''
  handleSearch()
}

const getActionType = (action: string) => {
  switch (action) {
    case 'Login':
      return 'info'
    case 'Logout':
      return 'info'
    case 'Create':
      return 'success'
    case 'Update':
      return 'warning'
    case 'Delete':
      return 'danger'
    default:
      return 'primary'
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
