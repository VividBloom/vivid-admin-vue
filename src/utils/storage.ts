const PREFIX = 'vue-admin'

const k = (key: string) => `${PREFIX}:${key}`

export const storage = {
  set<T>(key: string, value: T) {
    try {
      const data = JSON.stringify(value)
      localStorage.setItem(k(key), data)
    } catch {
      // noop
    }
  },
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const raw = localStorage.getItem(k(key))
      if (raw === null) return defaultValue
      return JSON.parse(raw) as T
    } catch {
      return defaultValue
    }
  },
  remove(key: string) {
    localStorage.removeItem(k(key))
  },
  clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(`${PREFIX}:`))
      .forEach(key => localStorage.removeItem(key))
  },
}
