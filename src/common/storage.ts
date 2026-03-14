const ACCESS_TOKEN_KEY = 'nex-mini-access-token'
const REFRESH_TOKEN_KEY = 'nex-mini-refresh-token'
const PROFILE_KEY = 'nex-mini-profile'

export function setAccessToken(token: string) {
  uni.setStorageSync(ACCESS_TOKEN_KEY, token)
}

export function getAccessToken() {
  return uni.getStorageSync(ACCESS_TOKEN_KEY) || ''
}

export function setRefreshToken(token: string) {
  uni.setStorageSync(REFRESH_TOKEN_KEY, token)
}

export function getRefreshToken() {
  return uni.getStorageSync(REFRESH_TOKEN_KEY) || ''
}

export function setProfile(profile: unknown) {
  uni.setStorageSync(PROFILE_KEY, profile)
}

export function getProfile<T>() {
  return (uni.getStorageSync(PROFILE_KEY) || null) as T | null
}

export function clearAuthStorage() {
  uni.removeStorageSync(ACCESS_TOKEN_KEY)
  uni.removeStorageSync(REFRESH_TOKEN_KEY)
  uni.removeStorageSync(PROFILE_KEY)
}

