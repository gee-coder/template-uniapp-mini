import { request } from './request'

export type AuthLoginType = 'username' | 'email' | 'phone'
export type AuthRegisterType = 'email' | 'phone'

export interface AuthOptions {
  enableUsernameLogin: boolean
  enableEmailLogin: boolean
  enablePhoneLogin: boolean
  enableEmailRegistration: boolean
  enablePhoneRegistration: boolean
  enableTwoFactor: boolean
}

export interface LoginPayload {
  account: string
  password?: string
  loginType: AuthLoginType
  verificationCode?: string
  captchaId?: string
  captchaCode?: string
  twoFactorCode?: string
}

export interface RegisterPayload {
  account: string
  password: string
  nickname?: string
  registerType: AuthRegisterType
  verificationCode?: string
  captchaId?: string
  captchaCode?: string
  smsCode?: string
}

export interface SendSMSCodePayload {
  phone: string
  purpose: 'login' | 'register' | 'two_factor'
}

export interface SendEmailCodePayload {
  email: string
  purpose: 'login' | 'register' | 'two_factor'
}

export interface SMSCodeResponse {
  provider: string
  expiresIn: number
  cooldownIn: number
  debugCode?: string
}

export interface CaptchaPayload {
  captchaId: string
  imageData: string
  expiresIn: number
}

export interface TwoFactorCodePayload {
  account: string
  loginType?: 'username'
}

export interface TwoFactorCodeResponse {
  channel: 'email' | 'phone'
  target: string
  provider: string
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

export function getCaptchaApi() {
  return request<CaptchaPayload>({
    url: '/auth/captcha',
    method: 'GET',
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

export function sendEmailCodeApi(payload: SendEmailCodePayload) {
  return request<SMSCodeResponse>({
    url: '/auth/email-codes',
    method: 'POST',
    data: payload,
  })
}

export function sendTwoFactorCodeApi(payload: TwoFactorCodePayload) {
  return request<TwoFactorCodeResponse>({
    url: '/auth/two-factor-codes',
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
