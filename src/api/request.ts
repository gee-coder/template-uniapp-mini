import { API_BASE_URL } from '@/common/constants'
import { clearAuthStorage, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from '@/common/storage'

interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
  requestId: string
}

let refreshPromise: Promise<string> | null = null

export function request<T>(options: UniApp.RequestOptions) {
  return new Promise<T>((resolve, reject) => {
    uni.request({
      ...options,
      url: `${API_BASE_URL}${options.url}`,
      header: {
        ...(options.header || {}),
        Authorization: getAccessToken() ? `Bearer ${getAccessToken()}` : '',
      },
      success: async (response) => {
        const { statusCode, data } = response
        const envelope = data as ApiEnvelope<T>

        if (statusCode === 401 && getRefreshToken()) {
          try {
            refreshPromise ??= refreshAccessToken()
            const accessToken = await refreshPromise
            refreshPromise = null
            setAccessToken(accessToken)
            resolve(await request<T>(options))
            return
          } catch (error) {
            refreshPromise = null
            clearAuthStorage()
            uni.reLaunch({ url: '/pages/login/index' })
            reject(error)
            return
          }
        }

        if (statusCode && statusCode >= 400) {
          reject(new Error(envelope?.message || 'Request failed'))
          return
        }

        if (envelope.code !== 0) {
          reject(new Error(envelope.message))
          return
        }

        resolve(envelope.data)
      },
      fail: (error) => reject(error),
    })
  })
}

async function refreshAccessToken() {
  const data = await new Promise<{ accessToken: string; refreshToken: string }>((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}/auth/refresh`,
      method: 'POST',
      data: {
        refreshToken: getRefreshToken(),
      },
      success: (response) => {
        const envelope = response.data as ApiEnvelope<{ accessToken: string; refreshToken: string }>
        if (response.statusCode && response.statusCode >= 400) {
          reject(new Error(envelope?.message || 'Refresh failed'))
          return
        }
        resolve(envelope.data)
      },
      fail: (error) => reject(error),
    })
  })

  setAccessToken(data.accessToken)
  setRefreshToken(data.refreshToken)
  return data.accessToken
}
