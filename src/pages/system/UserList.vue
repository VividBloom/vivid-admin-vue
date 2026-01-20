<!--
  用户列表页面 UserList
  - 展示用户表格，支持查看详情与跳转到创建用户页面（示例）
  - 数据为模拟示例，实际项目应通过 API 拉取
-->
<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="handleCreate">新增用户</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="userList">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button link type="primary" @click="viewDetail(scope.row.id)"> 详情 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const userList = ref<any[]>([])

defineOptions({ name: 'UserList' })

// 查看用户详情（示例）：可使用路径或命名路由两种方式
const viewDetail = (userId: number) => {
  router.push({ name: 'UserDetail', params: { id: userId } })
}

// 新增用户跳转（示例路由）
const handleCreate = () => router.push({ name: 'UserCreate' })

onMounted(() => loadUserList())

// 加载用户列表（此处为模拟数据）
const loadUserList = async () => {
  loading.value = true
  setTimeout(() => {
    userList.value = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: '管理员',
        createTime: '2025-01-01',
      },
      {
        id: 2,
        username: 'user1',
        email: 'user1@example.com',
        role: '普通用户',
        createTime: '2025-01-02',

        username: 'admin',
        email: 'admin@example.com',
        role: '管理员',
        createTime: '2025-01-01',
      },
      {
        id: 2,
        username: 'user1',
        email: 'user1@example.com',
        role: '普通用户',
        createTime: '2025-01-02',
      },
    ]
    loading.value = false
  }, 500)
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
