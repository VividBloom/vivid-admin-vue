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

// 方式1: 通过 props 接收参数 (需要在路由配置中设置 props: true)[3,5](@ref)
// defineProps<{
//   id?: string
// }>()

// 方式2: 通过 useRoute 获取参数[3,6](@ref)
const route = useRoute()
const userInfo = ref<any>(null)

onMounted(() => {
  loadUserDetail()
})

// 监听路由参数变化
watch(
  () => route.params.id,
  newId => {
    if (newId) {
      loadUserDetail()
    }
  }
)

const loadUserDetail = async () => {
  const userId = route.params.id
  // 模拟API调用
  setTimeout(() => {
    userInfo.value = {
      id: userId,
      username: `用户${userId}`,
      email: `user${userId}@example.com`,
      role: '普通用户',
      createTime: '2025-01-01',
    }
  }, 300)
}
</script>
