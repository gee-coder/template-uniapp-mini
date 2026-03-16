import { request } from './request'

export type AuthLoginType = 'username' | 'email' | 'phone'
export type AuthRegisterType = 'email' | 'phone'

export interface AuthOptions {
  enableUsernameLogin: boolean
  enableEmailLogin: boolean
  enablePhoneLogin: boolean
  enableEmailRegistration: boolean
  enablePhoneRegistration: boolean
}

export interface LoginPayload {
  account: string
  password: string
  loginType: AuthLoginType
  smsCode?: string
}

export interface RegisterPayload {
  account: string
  password: string
  nickname?: string
  registerType: AuthRegisterType
  smsCode?: string
}

export interface SendSMSCodePayload {
  phone: string
  purpose: 'login' | 'register'
}

export interface SMSCodeResponse {
  provider: string
  expiresIn: number
  cooldownIn: number
  debugCode?: string
}

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

export function getAuthOptionsApi() {
  return request<AuthOptions>({
    url: '/auth/options',
    method: 'GET',
  })
}

export function loginApi(payload: LoginPayload) {
  return request<TokenPayload>({
    url: '/auth/login',
    method: 'POST',
    data: payload,
  })
}

export function registerApi(payload: RegisterPayload) {
  return request<TokenPayload>({
    url: '/auth/register',
    method: 'POST',
    data: payload,
  })
}

export function sendSMSCodeApi(payload: SendSMSCodePayload) {
  return request<SMSCodeResponse>({
    url: '/auth/sms-codes',
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
