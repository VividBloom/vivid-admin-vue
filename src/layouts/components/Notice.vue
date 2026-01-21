<template>
  <el-dropdown class="header-action" trigger="click" @visible-change="handleVisibleChange">
    <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0">
      <div class="header-action-icon">
        <el-icon><div class="i-ep-bell" /></el-icon>
      </div>
    </el-badge>
    <template #dropdown>
      <div class="notice-dropdown">
        <el-tabs v-model="activeTab" stretch>
          <el-tab-pane :label="$t('notice.message') + (messageList.length ? `(${messageList.length})` : '')" name="message">
            <div class="notice-list">
              <div v-if="messageList.length === 0" class="empty-data">
                <el-empty :description="$t('notice.noMessage')" :image-size="60" />
              </div>
              <div v-else v-for="item in messageList" :key="item.id" class="notice-item" @click="handleItemClick(item)">
                <el-avatar :src="item.avatar" size="small" v-if="item.avatar" />
                <div class="notice-content">
                  <div class="notice-title">{{ item.title }}</div>
                  <div class="notice-time">{{ item.datetime }}</div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('notice.task') + (taskList.length ? `(${taskList.length})` : '')" name="task">
            <div class="notice-list">
              <div v-if="taskList.length === 0" class="empty-data">
                <el-empty :description="$t('notice.noTask')" :image-size="60" />
              </div>
              <div v-else v-for="item in taskList" :key="item.id" class="notice-item" @click="handleItemClick(item)">
                <div class="notice-content">
                  <div class="notice-title">
                    <el-tag v-if="item.tag" :type="item.tag.type" size="small" class="mr-2">{{ item.tag.text }}</el-tag>
                    {{ item.title }}
                  </div>
                  <div class="notice-desc" v-if="item.description">{{ item.description }}</div>
                  <div class="notice-time">{{ item.datetime }}</div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('notice.todo') + (todoList.length ? `(${todoList.length})` : '')" name="todo">
            <div class="notice-list">
              <div v-if="todoList.length === 0" class="empty-data">
                <el-empty :description="$t('notice.noTodo')" :image-size="60" />
              </div>
              <div v-else v-for="item in todoList" :key="item.id" class="notice-item" @click="handleItemClick(item)">
                <div class="notice-content">
                  <div class="notice-title">{{ item.title }}</div>
                  <div class="notice-desc" v-if="item.description">{{ item.description }}</div>
                  <div class="notice-time">{{ item.datetime }}</div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
        <div class="notice-actions">
          <el-button link @click="clearAll">{{ $t('notice.clear') }}</el-button>
          <el-divider direction="vertical" />
          <el-button link @click="viewMore">{{ $t('notice.more') }}</el-button>
        </div>
      </div>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getNoticeList, type NoticeItem } from '@/api/notice'
import { onMounted } from 'vue'

const activeTab = ref('message')
const list = ref<NoticeItem[]>([])

const fetchNotice = async () => {
  try {
    const res = await getNoticeList()
    list.value = res.data
  } catch (error) {
    console.error(error)
  }
}

const messageList = computed(() => list.value.filter(item => item.type === 'message'))
const taskList = computed(() => list.value.filter(item => item.type === 'task'))
const todoList = computed(() => list.value.filter(item => item.type === 'todo'))

const unreadCount = computed(() => list.value.filter(item => !item.read).length)

const handleVisibleChange = (visible: boolean) => {
  if (visible && list.value.length === 0) {
    fetchNotice()
  }
}

const handleItemClick = (item: NoticeItem) => {
  item.read = true
}

const clearAll = () => {
  list.value = []
}

const viewMore = () => {
  // TODO: navigate to notice center page
}

onMounted(() => {
  fetchNotice()
})
</script>

<style scoped lang="scss">
.header-action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;
}

.notice-dropdown {
  width: 300px;
  background-color: var(--el-bg-color);
}

.notice-list {
  max-height: 300px;
  overflow-y: auto;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background-color 0.3s;

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  &:last-child {
    border-bottom: none;
  }

  .el-avatar {
    margin-right: 12px;
    flex-shrink: 0;
  }

  .notice-content {
    flex: 1;
    min-width: 0;
  }

  .notice-title {
    font-size: 14px;
    color: var(--el-text-color-primary);
    margin-bottom: 4px;
    line-height: 1.4;
    word-break: break-all;
  }

  .notice-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
    line-height: 1.4;
  }

  .notice-time {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}

.notice-actions {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px 0;
  border-top: 1px solid var(--el-border-color-lighter);
}

.empty-data {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}
</style>
