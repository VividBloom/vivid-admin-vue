import type { Directive, DirectiveBinding } from 'vue'
import { logApi } from '@/api/log'
import { useUserStore } from '@/stores/user'

export const track: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    el.addEventListener('click', () => {
      const { value } = binding
      // 如果没有传值，或者传值为 false/null，则不记录（可选）
      if (!value) return

      const userStore = useUserStore()

      // 构造日志数据
      const logData = {
        module: value.module || 'System',
        action: value.action || 'Click',
        details: value.details || el.innerText || '',
        status: 'success' as const,
        username: userStore.userInfo?.username || 'admin',
      }

      // 发送日志
      // 使用 catch 忽略日志发送失败，以免影响业务
      logApi.createLog(logData).catch(err => {
        console.warn('Failed to send audit log:', err)
      })
    })
  },
}
