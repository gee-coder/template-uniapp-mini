import { defineStore } from 'pinia'
import { loginApi, profileApi, registerApi, type LoginPayload, type ProfileUser, type RegisterPayload } from '@/api/auth'
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
    async login(payload: LoginPayload) {
      const result = await loginApi(payload)
      this.applyTokenPayload(result)
    },
    async register(payload: RegisterPayload) {
      const result = await registerApi(payload)
      this.applyTokenPayload(result)
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
    applyTokenPayload(payload: { accessToken: string; refreshToken: string; user: ProfileUser }) {
      this.accessToken = payload.accessToken
      this.refreshToken = payload.refreshToken
      this.profile = payload.user
      setAccessToken(payload.accessToken)
      setRefreshToken(payload.refreshToken)
      setProfile(payload.user)
    },
  },
})
