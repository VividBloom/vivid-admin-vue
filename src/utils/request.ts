/**
 * 网络请求封装（基于 axios）
 * - 统一处理请求拦截、响应拦截与错误提示
 * - 返回统一的 ResponseData<T> 类型，便于上层调用时进行处理
 */
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useUserStore } from '@/stores/user'
import i18n from '@/i18n'

// 定义响应数据类型，后端返回数据应符合此结构
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
    // 请求拦截器：注入 Authorization token
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

    // 响应拦截器：对业务错误进行统一提示与处理
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data } = response
        if (data.code === 200 || data.success) {
          return data
        }

        // 业务错误处理
        ElMessage.error(data.message || i18n.global.t('http.error'))
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
    const t = i18n.global.t
    let message = t('http.error')

    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = t('http.badRequest')
          break
        case 401:
          message = t('http.unauthorized')
          this.handleUnauthorized()
          break
        case 403:
          message = t('http.forbidden')
          break
        case 404:
          message = t('http.notFound')
          break
        case 500:
          message = t('http.serverError')
          break
        default:
          message = `${t('http.error')}: ${error.response.status}`
      }
    } else if (error.request) {
      message = t('http.networkError')
    } else {
      message = error.message
    }

    ElMessage.error(message)
  }

  private handleUnauthorized(): void {
    const userStore = useUserStore()
    const t = i18n.global.t
    ElMessageBox.confirm(t('http.unauthorized'), t('http.hint'), {
      confirmButtonText: t('http.relogin'),
      cancelButtonText: t('http.cancel'),
      type: 'warning',
    }).then(() => {
      userStore.logout()
      window.location.reload()
    })
  }

  // 请求方法封装，均返回 ResponseData<T>
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ResponseData<T>> {
    return this.instance.get(url, config)
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ResponseData<T>> {
    return this.instance.post(url, data, config)
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ResponseData<T>> {
    return this.instance.put(url, data, config)
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ResponseData<T>> {
    return this.instance.delete(url, config)
  }
}

// 创建请求实例，baseURL 支持通过环境变量覆盖
const request = new Request({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  } as any,
})

export default request
