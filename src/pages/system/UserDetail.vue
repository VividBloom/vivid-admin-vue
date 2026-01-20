<!--
  用户详情页面 UserDetail
  - 显示单个用户的详细信息，支持通过路由参数或 props 获取 user id
  - 示例中使用 `useRoute` 获取参数并模拟加载数据
-->
<template>
  <div class="user-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户详情</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>

      <!-- 通过 props 接收参数 -->
      <div v-if="userInfo">
        <el-descriptions title="用户信息" border>
          <el-descriptions-item label="用户ID">{{ userInfo.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ userInfo.role }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ userInfo.createTime }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 或者直接通过 route 对象获取参数 -->
      <div v-else>
        <p>用户ID: {{ $route.params.id }}</p>
        <p>正在加载用户信息...</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

// 支持两种获取参数的方式：props 或 useRoute（此处使用 useRoute）
const route = useRoute()
const userInfo = ref<any>(null)

onMounted(() => loadUserDetail())

// 监听路由参数变化以重新加载数据
watch(
  () => route.params.id,
  newId => {
    if (newId) loadUserDetail()
  }
)

// 加载用户详情（示例为模拟异步数据）
const loadUserDetail = async () => {
  const userId = route.params.id
  setTimeout(() => {
    userInfo.value = {
      id: userId,
      username: `用户${userId}`,
      email: `user${userId}@example.com`,
      role: '普通用户',
      createTime: '2025-01-01',

      id: userId,
      username: `用户${userId}`,
      email: `user${userId}@example.com`,
      role: '普通用户',
      createTime: '2025-01-01',
    }
  }, 300)
}
</script>
