import { defineStore } from 'pinia'
import { loginApi, profileApi, type ProfileUser } from '@/api/auth'
import { clearAuthStorage, getAccessToken, getProfile, getRefreshToken, setAccessToken, setProfile, setRefreshToken } from '@/common/storage'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
    profile: getProfile<ProfileUser>(),
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.accessToken),
  },
  actions: {
    async login(payload: { username: string; password: string }) {
      const result = await loginApi(payload)
      this.accessToken = result.accessToken
      this.refreshToken = result.refreshToken
      this.profile = result.user
      setAccessToken(result.accessToken)
      setRefreshToken(result.refreshToken)
      setProfile(result.user)
    },
    async fetchProfile() {
      this.profile = await profileApi()
      setProfile(this.profile)
    },
    logout() {
      this.accessToken = ''
      this.refreshToken = ''
      this.profile = null
      clearAuthStorage()
      uni.reLaunch({ url: '/pages/login/index' })
    },
  },
})

