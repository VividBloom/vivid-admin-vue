<!--
  个人资料页面 Profile
  - 展示并编辑当前用户的基本信息
-->
<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <!-- 左侧：个人简介卡片 -->
      <el-col :xs="24" :sm="8">
        <el-card class="profile-intro-card" shadow="hover">
          <div class="user-info-header">
            <div class="avatar-wrapper">
              <el-avatar :size="100" :src="userStore.userInfo?.avatar || ''" class="user-avatar">
                {{ userStore.userName?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <div v-if="isEditMode" class="avatar-upload-icon">
                <div class="i-ep-camera" />
              </div>
            </div>
            <h2 class="user-name">{{ userStore.userName }}</h2>
            <p class="user-role">{{ profileForm.role }}</p>
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-value">12</div>
              <div class="stat-label">{{ $t('profile.projects') }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">2,300</div>
              <div class="stat-label">{{ $t('profile.contributions') }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">18</div>
              <div class="stat-label">{{ $t('profile.teams') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：详细信息表单 -->
      <el-col :xs="24" :sm="16">
        <el-card class="profile-detail-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">{{ $t('profile.basicInfo') }}</span>
              <el-button type="primary" link @click="toggleEditMode">
                <el-icon class="mr-1"><Edit /></el-icon>
                {{ isEditMode ? $t('profile.cancelEdit') : $t('profile.edit') }}
              </el-button>
            </div>
          </template>

          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            :disabled="!isEditMode"
            label-width="100px"
            label-position="right"
            size="large"
            class="profile-form"
          >
            <el-form-item :label="$t('profile.userId')">
              <el-input v-model="profileForm.id" disabled />
            </el-form-item>

            <el-form-item :label="$t('profile.username')" prop="username">
              <el-input
                v-model="profileForm.username"
                disabled
                :placeholder="$t('profile.enterUsername')"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item :label="$t('profile.email')" prop="email">
              <el-input v-model="profileForm.email" :placeholder="$t('profile.enterEmail')">
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item :label="$t('profile.phone')" prop="phone">
              <el-input v-model="profileForm.phone" :placeholder="$t('profile.enterPhone')">
                <template #prefix>
                  <el-icon><Iphone /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item :label="$t('profile.registerTime')">
              <el-date-picker
                v-model="profileForm.createTime"
                type="datetime"
                disabled
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item :label="$t('profile.bio')">
              <el-input
                v-model="profileForm.bio"
                type="textarea"
                :rows="4"
                :placeholder="$t('profile.enterBio')"
              />
            </el-form-item>

            <el-form-item v-if="isEditMode">
              <el-button type="primary" @click="handleSaveProfile">
                {{ $t('profile.save') }}
              </el-button>
              <el-button @click="resetForm">{{ $t('app.reset') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'

// 类型定义
interface ProfileForm {
  id: number
  username: string
  email: string
  phone: string
  role: string
  createTime: string
  bio?: string
}

const { t } = useI18n()

// 表单引用
const profileFormRef = ref<FormInstance>()

// 响应式数据
const isEditMode = ref(false)
const userStore = useUserStore()

// 表单数据
const profileForm = reactive<ProfileForm>({
  id: 0,
  username: '',
  email: '',
  phone: '',
  role: '',
  createTime: '',
  bio: t('profile.defaultBio'),
})

// 表单验证规则
const profileRules = computed<FormRules>(() => ({
  email: [
    { required: true, message: t('profile.enterEmail'), trigger: 'blur' },
    { type: 'email', message: t('profile.invalidEmail'), trigger: 'blur' },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: t('profile.invalidPhone'),
      trigger: 'blur',
    },
  ],
}))

// 方法定义
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (!isEditMode.value) resetForm()
}

// 将表单重置为当前用户信息的值
const resetForm = () => {
  if (userStore.userInfo) {
    Object.assign(profileForm, userStore.userInfo)
    // 模拟一些额外字段
    if (!profileForm.bio) profileForm.bio = t('profile.defaultBio')
  }
  if (profileFormRef.value) profileFormRef.value.clearValidate()
}

// 保存个人信息
const handleSaveProfile = async () => {
  if (!profileFormRef.value) return
  try {
    const valid = await profileFormRef.value.validate()
    if (!valid) return

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    userStore.updateUserInfo(profileForm)
    ElMessage.success(t('profile.updateSuccess'))
    isEditMode.value = false
  } catch (error) {
    ElMessage.error(t('profile.saveFailed'))
  }
}

// 生命周期
onMounted(() => {
  // 初始化表单数据
  resetForm()
})
</script>

<style scoped lang="scss">
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-intro-card {
  margin-bottom: 20px;
  text-align: center;

  .user-info-header {
    padding: 20px 0;
  }

  .avatar-wrapper {
    position: relative;
    display: inline-block;

    .user-avatar {
      border: 4px solid var(--el-bg-color);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    .avatar-upload-icon {
      position: absolute;
      bottom: 0;
      right: 0;
      background-color: var(--el-color-primary);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 2px solid var(--el-bg-color);
    }
  }

  .user-name {
    margin: 16px 0 8px;
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .user-role {
    color: var(--el-text-color-secondary);
    margin: 0;
  }

  .user-stats {
    display: flex;
    justify-content: space-around;
    padding: 20px 0;
    border-top: 1px solid var(--el-border-color-lighter);

    .stat-item {
      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
      .stat-label {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-top: 4px;
      }
    }
  }
}

.profile-detail-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.mr-1 {
  margin-right: 4px;
}
</style>
