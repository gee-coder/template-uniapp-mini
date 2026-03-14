import { request } from './request'

export interface ProfileUser {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  status: string
  roles: string[]
  permissions: string[]
}

export interface TokenPayload {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  user: ProfileUser
}

export function loginApi(payload: { username: string; password: string }) {
  return request<TokenPayload>({
    url: '/auth/login',
    method: 'POST',
    data: payload,
  })
}

export function profileApi() {
  return request<ProfileUser>({
    url: '/auth/profile',
    method: 'GET',
  })
}

