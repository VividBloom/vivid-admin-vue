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
          <span>{{ $t('route.userDetail') }}</span>
          <el-button @click="$router.back()">{{ $t('app.back') }}</el-button>
        </div>
      </template>

      <!-- 通过 props 接收参数 -->
      <div v-if="userInfo">
        <el-descriptions :title="$t('userDetail.info')" border>
          <el-descriptions-item :label="$t('userList.id')">{{ userInfo.id }}</el-descriptions-item>
          <el-descriptions-item :label="$t('userList.username')">{{
            userInfo.username
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('userList.email')">{{
            userInfo.email
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('userList.role')">{{
            userInfo.role
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('userList.createTime')">{{
            userInfo.createTime
          }}</el-descriptions-item>

          <el-descriptions-item :label="$t('userList.email')">{{
            userInfo.email
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('userList.role')">{{
            userInfo.role
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('userList.createTime')">{{
            userInfo.createTime
          }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 或者直接通过 route 对象获取参数 -->
      <div v-else>
        <p>{{ $t('userList.id') }}: {{ $route.params.id }}</p>
        <p>{{ $t('app.loading') }}</p>
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
      username: `User${userId}`,
      email: `user${userId}@example.com`,
      role: 'User',
      createTime: '2025-01-01',
    }
  }, 300)
}
</script>
