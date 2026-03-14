const DEFAULT_API_BASE_URL = 'http://localhost:8080/api/v1'

function normalizeApiBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '')
}

const customApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || ''

export const API_BASE_URL = normalizeApiBaseUrl(customApiBaseUrl || DEFAULT_API_BASE_URL)
export const API_BASE_URL_SOURCE = customApiBaseUrl ? 'env' : 'default'
export const API_BASE_URL_IS_LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(API_BASE_URL)
export const API_BASE_URL_DEVICE_HINT = API_BASE_URL_IS_LOCALHOST
  ? '如果接下来要在手机真机预览，请先把小程序的接口配置改成电脑的局域网地址。'
  : ''
