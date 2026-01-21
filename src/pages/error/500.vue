<template>
  <div class="error-page">
    <el-result icon="error" title="500" :sub-title="$t('route.500Subtitle')">
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">{{
          $t('route.backToHome')
        }}</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
