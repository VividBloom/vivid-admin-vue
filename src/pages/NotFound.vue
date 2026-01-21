<!--
  404 页面 NotFound
  - 简单的空页面提示，并提供返回首页按钮
-->
<template>
  <div class="not-found">
    <el-result icon="warning" title="404" :sub-title="$t('route.notFoundSubtitle')">
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">{{
          $t('route.backToHome')
        }}</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
