<!--
  修改密码页面
  - 提供修改用户密码的功能
  - 包含原密码、新密码、确认密码的表单校验
-->
<template>
  <div class="change-password-container">
    <el-card class="password-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">{{ $t('changePassword.title') }}</span>
          <el-tooltip :content="$t('changePassword.tooltip')" placement="top">
            <el-icon class="info-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>

      <el-alert
        :title="$t('changePassword.alert')"
        type="info"
        show-icon
        :closable="false"
        class="mb-6"
      />

      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
        label-position="right"
        status-icon
        size="large"
        class="password-form"
      >
        <el-form-item :label="$t('changePassword.oldPassword')" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            :placeholder="$t('changePassword.oldPasswordPlaceholder')"
            prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item :label="$t('changePassword.newPassword')" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            :placeholder="$t('changePassword.newPasswordPlaceholder')"
            prefix-icon="Key"
          />
        </el-form-item>

        <el-form-item :label="$t('changePassword.confirmPassword')" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            :placeholder="$t('changePassword.confirmPasswordPlaceholder')"
            prefix-icon="Check"
          />
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button @click="resetForm">{{ $t('app.reset') }}</el-button>
            <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">
              {{ $t('changePassword.submit') }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'
import { Lock, Key, Check, InfoFilled } from '@element-plus/icons-vue'

interface PasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

// 表单引用
const passwordFormRef = ref<FormInstance>()

// 响应式数据
const passwordLoading = ref(false)

const passwordForm = reactive<PasswordForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 表单验证规则
const passwordRules = computed<FormRules>(() => ({
  oldPassword: [
    { required: true, message: t('changePassword.oldPasswordPlaceholder'), trigger: 'blur' },
    { min: 6, message: t('changePassword.lengthError'), trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: t('changePassword.newPasswordPlaceholder'), trigger: 'blur' },
    { min: 6, message: t('changePassword.lengthError'), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === passwordForm.oldPassword) {
          callback(new Error(t('changePassword.diffError')))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: t('changePassword.confirmPasswordPlaceholder'), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error(t('changePassword.diffError')))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}))

// 重置表单
const resetForm = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

// 修改密码：校验后显示确认对话框并调用登出（模拟场景）
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return
    passwordLoading.value = true
    await ElMessageBox.confirm(t('app.confirmLogout'), t('app.confirm'), {
      confirmButtonText: t('app.ok'),
      cancelButtonText: t('app.cancel'),
      type: 'warning',
    })

    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    Object.assign(passwordForm, { oldPassword: '', newPassword: '', confirmPassword: '' })
    if (passwordFormRef.value) passwordFormRef.value.resetFields()

    ElMessage.success(t('changePassword.success'))
    setTimeout(() => userStore.logout(), 2000)
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
      ElMessage.error(t('changePassword.failed'))
    }
  } finally {
    passwordLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.change-password-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 0 20px;
}

.password-card {
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 16px 20px;
    font-weight: 600;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 18px;
  color: var(--el-text-color-primary);
}

.info-icon {
  color: var(--el-text-color-secondary);
  cursor: help;
}

.password-form {
  margin-top: 20px;
  padding-right: 20px;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.mb-6 {
  margin-bottom: 24px;
}
</style>
