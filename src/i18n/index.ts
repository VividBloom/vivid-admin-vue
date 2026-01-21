import { createI18n } from 'vue-i18n'
import zhCn from './locales/zh-cn'
import en from './locales/en'

// 获取浏览器语言或默认中文
const getBrowserLanguage = () => {
  const navigatorLang = navigator.language
  if (navigatorLang.includes('en')) {
    return 'en'
  }
  return 'zh-cn'
}

// 尝试从 localStorage 获取语言设置 (兼容 Pinia 持久化)
const getLocalLanguage = () => {
  try {
    const appStateStr = localStorage.getItem('app')
    if (appStateStr) {
      const appState = JSON.parse(appStateStr)
      if (appState.language) {
        return appState.language
      }
    }
  } catch (e) {
    console.warn('Failed to parse app state from localStorage', e)
  }
  return getBrowserLanguage()
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API
  locale: getLocalLanguage(),
  fallbackLocale: 'zh-cn',
  globalInjection: true, // 全局注入 $t
  messages: {
    'zh-cn': zhCn,
    en: en,
  },
})

export default i18n
