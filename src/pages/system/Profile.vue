<template>
  <div class="profile-container">
    <!-- 个人信息卡片 -->
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">个人信息</span>
          <el-button type="primary" size="small" @click="toggleEditMode">
            {{ isEditMode ? '取消编辑' : '编辑信息' }}
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
      >
        <el-form-item label="用户ID">
          <el-input v-model="profileForm.id" disabled />
        </el-form-item>

        <el-form-item label="用户名" prop="username">
          <el-input v-model="profileForm.username" :disabled="true" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="角色">
          <el-tag type="info">{{ profileForm.role }}</el-tag>
        </el-form-item>

        <el-form-item label="注册时间">
          <span class="readonly-text">{{ profileForm.createTime }}</span>
        </el-form-item>

        <el-form-item v-if="isEditMode">
          <el-button type="primary" @click="handleSaveProfile"> 保存修改 </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 修改密码卡片 -->
    <el-card class="profile-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span class="header-title">修改密码</span>
        </div>
      </template>

      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入原密码"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="warning" :loading="passwordLoading" @click="handleChangePassword">
            修改密码
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 类型定义
interface ProfileForm {
  id: string
  username: string
  email: string
  phone: string
  role: string
  createTime: string
}

interface PasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

// 表单引用
const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

// 响应式数据
const isEditMode = ref(false)
const passwordLoading = ref(false)
const userStore = useUserStore()

// 表单数据
const profileForm = reactive<ProfileForm>({
  id: '',
  username: '',
  email: '',
  phone: '',
  role: '',
  createTime: '',
})

const passwordForm = reactive<PasswordForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 表单验证规则
const profileRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur',
    },
  ],
}

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === passwordForm.oldPassword) {
          callback(new Error('新密码不能与原密码相同'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// 方法定义
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (!isEditMode.value) {
    resetForm()
  }
}

const resetForm = () => {
  // 重置表单到初始值
  Object.assign(profileForm, userStore.userInfo)
  if (profileFormRef.value) {
    profileFormRef.value.clearValidate()
  }
}

const handleSaveProfile = async () => {
  if (!profileFormRef.value) return

  try {
    const valid = await profileFormRef.value.validate()
    if (!valid) return

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新用户信息
    userStore.updateUserInfo(profileForm)

    ElMessage.success('个人信息更新成功')
    isEditMode.value = false
  } catch (error) {
    ElMessage.error('保存失败，请检查表单数据')
  }
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return

    passwordLoading.value = true

    // 确认对话框
    await ElMessageBox.confirm('确定要修改密码吗？修改后需要重新登录。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 清空密码表单
    Object.assign(passwordForm, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    })

    if (passwordFormRef.value) {
      passwordFormRef.value.resetFields()
    }

    ElMessage.success('密码修改成功，请重新登录')

    // 延迟跳转到登录页
    setTimeout(() => {
      userStore.logout()
    }, 2000)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('密码修改失败，请检查原密码是否正确')
    }
  } finally {
    passwordLoading.value = false
  }
}

// 生命周期
onMounted(() => {
  // 初始化表单数据
  Object.assign(profileForm, userStore.userInfo)
})
</script>

<style scoped lang="scss">
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-card {
  margin-bottom: 20px;

  :deep(.el-card__header) {
    padding: 16px 20px;
    background-color: #f5f7fa;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.readonly-text {
  color: #909399;
  font-size: 14px;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-input) {
  max-width: 300px;
}

:deep(.el-tag) {
  margin-right: 10px;
}
</style>
