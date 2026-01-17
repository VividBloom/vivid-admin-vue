import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useUserStore } from '@/stores/user'

// 定义响应数据类型
export interface ResponseData<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

class Request {
  private instance: AxiosInstance

  constructor(config: InternalAxiosRequestConfig) {
    this.instance = axios.create(config)
    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const userStore = useUserStore()
        // 添加token
        if (userStore.token && config.headers) {
          config.headers.Authorization = `Bearer ${userStore.token}`
        }
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data } = response
        if (data.code === 200 || data.success) {
          return data
        }

        // 业务错误处理
        ElMessage.error(data.message || '请求失败')
        return Promise.reject(new Error(data.message || 'Error'))
      },
      error => {
        // http 错误处理
        this.handleHttpError(error)
        return Promise.reject(error)
      }
    )
  }

  private handleHttpError(error: any): void {
    let message = '请求失败'

    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '登录已过期，请重新登录'
          this.handleUnauthorized()
          break
        case 403:
          message = '没有权限访问该资源'
          break
        case 404:
          message = '请求资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `网络错误: ${error.response.status}`
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络'
    } else {
      message = error.message
    }

    ElMessage.error(message)
  }

  private handleUnauthorized(): void {
    const userStore = useUserStore()
    ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      userStore.logout()
      window.location.reload()
    })
  }

  // 请求方法
  public get<T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<ResponseData<T>> {
    return this.instance.get(url, config)
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: InternalAxiosRequestConfig
  ): Promise<ResponseData<T>> {
    return this.instance.post(url, data, config)
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: InternalAxiosRequestConfig
  ): Promise<ResponseData<T>> {
    return this.instance.put(url, data, config)
  }

  public delete<T = any>(
    url: string,
    config?: InternalAxiosRequestConfig
  ): Promise<ResponseData<T>> {
    return this.instance.delete(url, config)
  }
}

// 创建请求实例
const request = new Request({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default request
