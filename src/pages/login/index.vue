<template>
  <view class="page-shell login-page">
    <view class="card login-card">
      <text class="eyebrow">统一认证模板</text>
      <text class="title">支持账号、邮箱、手机号登录注册，并按安全策略动态切换图形验证码与双因子认证。</text>
      <text class="hint">接口地址：{{ apiBaseUrl }}</text>
      <text v-if="deviceHint" class="hint hint--warning">{{ deviceHint }}</text>

      <view class="mode-switch">
        <button :class="['mode-btn', mode === 'login' ? 'mode-btn--active' : '']" @click="mode = 'login'">登录</button>
        <button
          v-if="registerTabs.length"
          :class="['mode-btn', mode === 'register' ? 'mode-btn--active' : '']"
          @click="mode = 'register'"
        >
          注册
        </button>
      </view>

      <view v-if="mode === 'login'" class="panel">
        <view class="channel-switch">
          <button
            v-for="tab in loginTabs"
            :key="tab.value"
            :class="['channel-btn', loginType === tab.value ? 'channel-btn--active' : '']"
            @click="loginType = tab.value"
          >
            {{ tab.label }}
          </button>
        </view>

        <view class="field">
          <text>{{ loginAccountLabel }}</text>
          <input v-model="loginForm.account" :placeholder="loginPlaceholder" />
        </view>

        <view v-if="loginNeedsPassword" class="field">
          <text>{{ loginPasswordLabel }}</text>
          <input v-model="loginForm.password" password :placeholder="loginPasswordPlaceholder" />
        </view>

        <view v-if="loginNeedsVerificationCode" class="field">
          <text>{{ loginCodeLabel }}</text>
          <view class="code-row">
            <input v-model="loginForm.verificationCode" :placeholder="loginCodePlaceholder" maxlength="8" />
            <button class="code-btn" :disabled="loading || loginCodeCooldown > 0" @click="sendLoginCode">
              {{ loginCodeCooldown > 0 ? `${loginCodeCooldown}s` : '发送验证码' }}
            </button>
          </view>
        </view>

        <view v-if="loginNeedsCaptcha" class="field">
          <text>图形验证码</text>
          <view class="code-row">
            <input v-model="loginForm.captchaCode" placeholder="请输入图中的字符" maxlength="8" />
            <button class="captcha-btn" :disabled="captchaLoading" @click="refreshLoginCaptcha">
              <image v-if="loginCaptcha.imageData" class="captcha-image" :src="loginCaptcha.imageData" mode="aspectFill" />
              <text v-else>{{ captchaLoading ? '加载中...' : '点击刷新' }}</text>
            </button>
          </view>
          <text class="hint">邮箱和手机号登录始终需要图形验证码；账号登录输错 2 次后，第 3 次开始需要。</text>
        </view>

        <view v-if="loginNeedsTwoFactorCode" class="field">
          <text>双因子验证码</text>
          <view class="code-row">
            <input v-model="loginForm.twoFactorCode" placeholder="请输入第二重验证码" maxlength="8" />
            <button class="code-btn" :disabled="loading || twoFactorCooldown > 0" @click="sendTwoFactorCode">
              {{ twoFactorCooldown > 0 ? `${twoFactorCooldown}s` : '发送验证码' }}
            </button>
          </view>
          <text class="hint">{{ twoFactorHint }}</text>
        </view>

        <button class="action-btn" :disabled="loading" @click="submitLogin">
          {{ loading ? '登录中...' : '立即登录' }}
        </button>
        <text class="hint">{{ loginHint }}</text>
      </view>

      <view v-else class="panel">
        <view class="channel-switch">
          <button
            v-for="tab in registerTabs"
            :key="tab.value"
            :class="['channel-btn', registerType === tab.value ? 'channel-btn--active' : '']"
            @click="registerType = tab.value"
          >
            {{ tab.label }}
          </button>
        </view>

        <view class="field">
          <text>{{ registerAccountLabel }}</text>
          <input v-model="registerForm.account" :placeholder="registerPlaceholder" />
        </view>

        <view class="field">
          <text>昵称</text>
          <input v-model="registerForm.nickname" placeholder="可选，不填则自动生成" />
        </view>

        <view v-if="registerNeedsVerificationCode" class="field">
          <text>{{ registerCodeLabel }}</text>
          <view class="code-row">
            <input v-model="registerForm.verificationCode" :placeholder="registerCodePlaceholder" maxlength="8" />
            <button class="code-btn" :disabled="loading || registerCooldown > 0" @click="sendRegisterCode">
              {{ registerCooldown > 0 ? `${registerCooldown}s` : '发送验证码' }}
            </button>
          </view>
        </view>

        <view v-if="registerNeedsCaptcha" class="field">
          <text>图形验证码</text>
          <view class="code-row">
            <input v-model="registerForm.captchaCode" placeholder="请输入图中的字符" maxlength="8" />
            <button class="captcha-btn" :disabled="captchaLoading" @click="refreshRegisterCaptcha">
              <image
                v-if="registerCaptcha.imageData"
                class="captcha-image"
                :src="registerCaptcha.imageData"
                mode="aspectFill"
              />
              <text v-else>{{ captchaLoading ? '加载中...' : '点击刷新' }}</text>
            </button>
          </view>
          <text class="hint">注册时也需要完成图形验证码，用来确认当前请求来自真实用户。</text>
        </view>

        <view class="field">
          <text>密码</text>
          <input v-model="registerForm.password" password placeholder="至少 6 位" />
        </view>

        <view class="field">
          <text>确认密码</text>
          <input v-model="registerForm.confirmPassword" password placeholder="再次输入密码" />
        </view>

        <button class="action-btn" :disabled="loading" @click="submitRegister">
          {{ loading ? '注册中...' : '创建账号' }}
        </button>
        <text class="hint">{{ registerHint }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { API_BASE_URL, API_BASE_URL_DEVICE_HINT } from '@/common/constants'
import {
  getAuthOptionsApi,
  getCaptchaApi,
  sendEmailCodeApi,
  sendSMSCodeApi,
  sendTwoFactorCodeApi,
  type AuthLoginType,
  type AuthOptions,
  type AuthRegisterType,
  type SMSCodeResponse,
} from '@/api/auth'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const loading = ref(false)
const captchaLoading = ref(false)
const apiBaseUrl = API_BASE_URL
const deviceHint = API_BASE_URL_DEVICE_HINT

const phonePattern = /^\+?[0-9]{6,20}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const fallbackOptions: AuthOptions = {
  enableUsernameLogin: true,
  enableEmailLogin: true,
  enablePhoneLogin: true,
  enableEmailRegistration: true,
  enablePhoneRegistration: true,
  enableTwoFactor: false,
}

const options = ref<AuthOptions>(fallbackOptions)
const mode = ref<'login' | 'register'>('login')
const loginType = ref<AuthLoginType>('username')
const registerType = ref<AuthRegisterType>('email')
const loginCodeCooldown = ref(0)
const registerCooldown = ref(0)
const twoFactorCooldown = ref(0)
const usernameFailureCount = ref(0)
const forceUsernameCaptcha = ref(false)
const twoFactorTarget = ref('')

const loginForm = reactive({
  account: 'admin',
  password: 'Admin123!',
  verificationCode: '',
  captchaCode: '',
  twoFactorCode: '',
})

const loginCaptcha = reactive({
  captchaId: '',
  imageData: '',
})

const registerForm = reactive({
  account: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  verificationCode: '',
  captchaCode: '',
  smsCode: '',
})

const registerCaptcha = reactive({
  captchaId: '',
  imageData: '',
})

let loginCodeTimer: ReturnType<typeof setInterval> | null = null
let registerTimer: ReturnType<typeof setInterval> | null = null
let twoFactorTimer: ReturnType<typeof setInterval> | null = null

const loginTabs = computed(() => {
  const tabs: Array<{ value: AuthLoginType; label: string }> = []
  if (options.value.enableUsernameLogin) tabs.push({ value: 'username', label: '账号' })
  if (options.value.enableEmailLogin) tabs.push({ value: 'email', label: '邮箱' })
  if (options.value.enablePhoneLogin) tabs.push({ value: 'phone', label: '手机号' })
  return tabs
})

const registerTabs = computed(() => {
  const tabs: Array<{ value: AuthRegisterType; label: string }> = []
  if (options.value.enableEmailRegistration) tabs.push({ value: 'email', label: '邮箱注册' })
  if (options.value.enablePhoneRegistration) tabs.push({ value: 'phone', label: '手机号注册' })
  return tabs
})

const loginNeedsVerificationCode = computed(() => loginType.value === 'email' || loginType.value === 'phone')
const loginNeedsPassword = computed(() => loginType.value === 'username' || options.value.enableTwoFactor)
const loginNeedsTwoFactorCode = computed(() => loginType.value === 'username' && options.value.enableTwoFactor)
const usernameNeedsCaptcha = computed(() => loginType.value === 'username' && (forceUsernameCaptcha.value || usernameFailureCount.value >= 2))
const loginNeedsCaptcha = computed(() => loginType.value !== 'username' || usernameNeedsCaptcha.value)
const registerNeedsVerificationCode = computed(() => registerType.value === 'email' || registerType.value === 'phone')
const registerNeedsCaptcha = computed(() => registerNeedsVerificationCode.value)

const loginAccountLabel = computed(() => {
  switch (loginType.value) {
    case 'email':
      return '邮箱'
    case 'phone':
      return '手机号'
    default:
      return '账号'
  }
})

const loginPlaceholder = computed(() => {
  switch (loginType.value) {
    case 'email':
      return 'name@example.com'
    case 'phone':
      return '18800000000'
    default:
      return 'admin'
  }
})

const loginPasswordLabel = computed(() => (loginType.value === 'username' ? '密码' : '第二重密码'))
const loginPasswordPlaceholder = computed(() => (loginType.value === 'username' ? '请输入密码' : '请输入密码完成第二重认证'))
const loginCodeLabel = computed(() => (loginType.value === 'email' ? '邮箱验证码' : '短信验证码'))
const loginCodePlaceholder = computed(() => (loginType.value === 'email' ? '请输入邮箱验证码' : '请输入短信验证码'))
const loginHint = computed(() => {
  if (loginType.value === 'username') {
    return options.value.enableTwoFactor
      ? '账号登录先验证密码，再验证绑定手机号或邮箱收到的双因子验证码。'
      : '账号登录默认只需要密码，连续输错 2 次后会要求图形验证码。'
  }
  return options.value.enableTwoFactor
    ? '邮箱和手机号登录先校验验证码与图形验证码，再输入密码完成第二重认证。'
    : '邮箱和手机号登录只需要验证码和图形验证码。'
})
const twoFactorHint = computed(() =>
  twoFactorTarget.value ? `双因子验证码将发送至 ${twoFactorTarget.value}。` : '向当前账号绑定的手机号或邮箱发送第二重验证码。',
)

const registerAccountLabel = computed(() => (registerType.value === 'email' ? '邮箱' : '手机号'))
const registerPlaceholder = computed(() => (registerType.value === 'email' ? 'name@example.com' : '18800000000'))
const registerCodeLabel = computed(() => (registerType.value === 'email' ? '邮箱验证码' : '短信验证码'))
const registerCodePlaceholder = computed(() => (registerType.value === 'email' ? '请输入邮箱验证码' : '请输入短信验证码'))
const registerHint = computed(() =>
  registerType.value === 'email'
    ? '邮箱注册需要邮箱验证码、图形验证码，以及你要设置的登录密码。'
    : '手机号注册需要短信验证码、图形验证码，以及你要设置的登录密码。',
)

watch(loginTabs, (tabs) => {
  if (!tabs.some((tab) => tab.value === loginType.value) && tabs[0]) {
    loginType.value = tabs[0].value
  }
}, { immediate: true })

watch(registerTabs, (tabs) => {
  if (!tabs.length) {
    mode.value = 'login'
    return
  }
  if (!tabs.some((tab) => tab.value === registerType.value)) {
    registerType.value = tabs[0].value
  }
}, { immediate: true })

watch(loginType, (nextType) => {
  loginForm.verificationCode = ''
  loginForm.captchaCode = ''
  loginForm.twoFactorCode = ''
  twoFactorTarget.value = ''
  clearCooldown('loginCode')
  clearCooldown('twoFactor')

  if (nextType !== 'username') {
    usernameFailureCount.value = 0
    forceUsernameCaptcha.value = false
    void ensureLoginCaptcha(true)
  } else if (!usernameNeedsCaptcha.value) {
    clearLoginCaptcha()
  }
}, { immediate: true })

watch(() => loginForm.account, () => {
  if (loginType.value === 'username') {
    usernameFailureCount.value = 0
    forceUsernameCaptcha.value = false
    if (!usernameNeedsCaptcha.value) {
      clearLoginCaptcha()
    }
  }
})

watch(loginNeedsCaptcha, (value) => {
  if (value) {
    void ensureLoginCaptcha()
  } else {
    clearLoginCaptcha()
  }
}, { immediate: true })

watch(registerType, () => {
  registerForm.verificationCode = ''
  registerForm.captchaCode = ''
  registerForm.smsCode = ''
  clearCooldown('register')
  void ensureRegisterCaptcha(true)
}, { immediate: true })

watch(registerNeedsCaptcha, (value) => {
  if (value) {
    void ensureRegisterCaptcha()
  } else {
    clearRegisterCaptcha()
  }
}, { immediate: true })

onMounted(async () => {
  try {
    options.value = await getAuthOptionsApi()
  } catch {
    showTextToast('认证配置读取失败，已使用默认展示')
  }
})

onUnmounted(() => {
  clearCooldown('loginCode')
  clearCooldown('register')
  clearCooldown('twoFactor')
})

async function submitLogin() {
  if (!loginForm.account.trim()) {
    showTextToast('请先输入账号信息')
    return
  }
  if (loginNeedsPassword.value && !loginForm.password.trim()) {
    showTextToast('请先输入密码')
    return
  }
  if (loginNeedsVerificationCode.value && !loginForm.verificationCode.trim()) {
    showTextToast(loginType.value === 'email' ? '请先输入邮箱验证码' : '请先输入短信验证码')
    return
  }
  if (loginNeedsCaptcha.value && (!loginCaptcha.captchaId || !loginForm.captchaCode.trim())) {
    await ensureLoginCaptcha(true)
    showTextToast('请先完成图形验证码')
    return
  }
  if (loginNeedsTwoFactorCode.value && !loginForm.twoFactorCode.trim()) {
    showTextToast('请先输入双因子验证码')
    return
  }

  loading.value = true
  try {
    await authStore.login({
      account: loginForm.account.trim(),
      password: loginNeedsPassword.value ? loginForm.password : undefined,
      loginType: loginType.value,
      verificationCode: loginNeedsVerificationCode.value ? loginForm.verificationCode.trim() : undefined,
      captchaId: loginNeedsCaptcha.value ? loginCaptcha.captchaId : undefined,
      captchaCode: loginNeedsCaptcha.value ? loginForm.captchaCode.trim() : undefined,
      twoFactorCode: loginNeedsTwoFactorCode.value ? loginForm.twoFactorCode.trim() : undefined,
    })
    resetUsernameProtection()
    uni.switchTab({ url: '/pages/index/index' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败'
    await handleLoginFailure(message)
    showTextToast(message)
  } finally {
    loading.value = false
  }
}

async function submitRegister() {
  if (!registerTabs.value.length) {
    showTextToast('当前没有开放注册方式')
    return
  }
  if (!registerForm.account.trim() || !registerForm.password) {
    showTextToast('请先填写完整注册信息')
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    showTextToast('两次输入的密码不一致')
    return
  }
  if (!registerForm.verificationCode.trim()) {
    showTextToast(registerType.value === 'email' ? '请先输入邮箱验证码' : '请先输入短信验证码')
    return
  }
  if (!registerCaptcha.captchaId || !registerForm.captchaCode.trim()) {
    await ensureRegisterCaptcha(true)
    showTextToast('请先完成图形验证码')
    return
  }

  loading.value = true
  try {
    await authStore.register({
      account: registerForm.account.trim(),
      nickname: registerForm.nickname.trim(),
      password: registerForm.password,
      registerType: registerType.value,
      verificationCode: registerForm.verificationCode.trim(),
      captchaId: registerCaptcha.captchaId,
      captchaCode: registerForm.captchaCode.trim(),
      smsCode: registerType.value === 'phone' ? registerForm.verificationCode.trim() : undefined,
    })
    uni.switchTab({ url: '/pages/index/index' })
  } catch (error) {
    showTextToast(error instanceof Error ? error.message : '注册失败')
  } finally {
    loading.value = false
  }
}

async function sendLoginCode() {
  if (loginType.value === 'email') {
    if (!emailPattern.test(loginForm.account.trim().toLowerCase())) {
      showTextToast('请先输入有效邮箱')
      return
    }
    await sendEmailLoginCode()
    return
  }

  if (loginType.value === 'phone') {
    const phone = normalizePhone(loginForm.account)
    if (!phone) {
      showTextToast('请先输入有效手机号')
      return
    }
    await sendPhoneLoginCode(phone)
  }
}

async function sendPhoneLoginCode(phone: string) {
  try {
    const payload = await sendSMSCodeApi({ phone, purpose: 'login' })
    applyLoginDebugCode(payload)
    startCooldown('loginCode', payload.cooldownIn || 60)
    showTextToast(buildCodeMessage(payload, '短信验证码'))
  } catch (error) {
    showTextToast(error instanceof Error ? error.message : '验证码发送失败')
  }
}

async function sendEmailLoginCode() {
  try {
    const payload = await sendEmailCodeApi({
      email: loginForm.account.trim().toLowerCase(),
      purpose: 'login',
    })
    applyLoginDebugCode(payload)
    startCooldown('loginCode', payload.cooldownIn || 60)
    showTextToast(buildCodeMessage(payload, '邮箱验证码'))
  } catch (error) {
    showTextToast(error instanceof Error ? error.message : '验证码发送失败')
  }
}

async function sendTwoFactorCode() {
  if (loginType.value !== 'username' || !loginForm.account.trim()) {
    showTextToast('请先输入账号')
    return
  }

  try {
    const payload = await sendTwoFactorCodeApi({
      account: loginForm.account.trim(),
      loginType: 'username',
    })
    twoFactorTarget.value = payload.target
    if (payload.debugCode) {
      loginForm.twoFactorCode = payload.debugCode
    }
    startCooldown('twoFactor', payload.cooldownIn || 60)
    showTextToast(payload.debugCode ? `双因子验证码：${payload.debugCode}` : `双因子验证码已发送至 ${payload.target}`)
  } catch (error) {
    showTextToast(error instanceof Error ? error.message : '双因子验证码发送失败')
  }
}

async function sendRegisterCode() {
  if (registerType.value === 'email') {
    if (!emailPattern.test(registerForm.account.trim().toLowerCase())) {
      showTextToast('请先输入有效邮箱')
      return
    }
    await sendRegisterEmailCode()
    return
  }

  const phone = normalizePhone(registerForm.account)
  if (!phone) {
    showTextToast('请先输入有效手机号')
    return
  }
  await sendRegisterSMSCode(phone)
}

async function sendRegisterEmailCode() {
  try {
    const payload = await sendEmailCodeApi({
      email: registerForm.account.trim().toLowerCase(),
      purpose: 'register',
    })
    applyRegisterDebugCode(payload)
    startCooldown('register', payload.cooldownIn || 60)
    showTextToast(buildCodeMessage(payload, '邮箱验证码'))
  } catch (error) {
    showTextToast(error instanceof Error ? error.message : '验证码发送失败')
  }
}

async function sendRegisterSMSCode(phone: string) {
  try {
    const payload = await sendSMSCodeApi({ phone, purpose: 'register' })
    applyRegisterDebugCode(payload)
    startCooldown('register', payload.cooldownIn || 60)
    showTextToast(buildCodeMessage(payload, '短信验证码'))
  } catch (error) {
    showTextToast(error instanceof Error ? error.message : '验证码发送失败')
  }
}

async function ensureLoginCaptcha(force = false) {
  if (!force && loginCaptcha.captchaId && loginCaptcha.imageData) {
    return
  }
  await refreshLoginCaptcha()
}

async function ensureRegisterCaptcha(force = false) {
  if (!force && registerCaptcha.captchaId && registerCaptcha.imageData) {
    return
  }
  await refreshRegisterCaptcha()
}

async function refreshLoginCaptcha() {
  captchaLoading.value = true
  try {
    const payload = await getCaptchaApi()
    loginCaptcha.captchaId = payload.captchaId
    loginCaptcha.imageData = payload.imageData
    loginForm.captchaCode = ''
  } catch (error) {
    showTextToast(error instanceof Error ? error.message : '图形验证码加载失败')
  } finally {
    captchaLoading.value = false
  }
}

async function refreshRegisterCaptcha() {
  captchaLoading.value = true
  try {
    const payload = await getCaptchaApi()
    registerCaptcha.captchaId = payload.captchaId
    registerCaptcha.imageData = payload.imageData
    registerForm.captchaCode = ''
  } catch (error) {
    showTextToast(error instanceof Error ? error.message : '图形验证码加载失败')
  } finally {
    captchaLoading.value = false
  }
}

function clearLoginCaptcha() {
  loginCaptcha.captchaId = ''
  loginCaptcha.imageData = ''
  loginForm.captchaCode = ''
}

function clearRegisterCaptcha() {
  registerCaptcha.captchaId = ''
  registerCaptcha.imageData = ''
  registerForm.captchaCode = ''
}

async function handleLoginFailure(message: string) {
  if (loginType.value !== 'username') {
    if (loginNeedsCaptcha.value) {
      await refreshLoginCaptcha()
    }
    return
  }

  const normalized = message.toLowerCase()
  if (normalized.includes('captcha')) {
    forceUsernameCaptcha.value = true
    await refreshLoginCaptcha()
    return
  }
  if (normalized.includes('two-factor') || normalized.includes('second-factor')) {
    return
  }

  usernameFailureCount.value += 1
  if (usernameFailureCount.value >= 2) {
    forceUsernameCaptcha.value = true
    await refreshLoginCaptcha()
  }
}

function resetUsernameProtection() {
  usernameFailureCount.value = 0
  forceUsernameCaptcha.value = false
  clearLoginCaptcha()
  twoFactorTarget.value = ''
}

function applyLoginDebugCode(payload: SMSCodeResponse) {
  if (payload.debugCode) {
    loginForm.verificationCode = payload.debugCode
  }
}

function applyRegisterDebugCode(payload: SMSCodeResponse) {
  if (payload.debugCode) {
    registerForm.verificationCode = payload.debugCode
    registerForm.smsCode = payload.debugCode
  }
}

function buildCodeMessage(payload: SMSCodeResponse, label: string) {
  if (payload.debugCode) {
    return `${label}：${payload.debugCode}`
  }
  return `${label}已发送`
}

function startCooldown(kind: 'loginCode' | 'register' | 'twoFactor', seconds: number) {
  clearCooldown(kind)
  const target = kind === 'loginCode' ? loginCodeCooldown : kind === 'register' ? registerCooldown : twoFactorCooldown
  target.value = Math.max(0, Math.round(seconds))

  const timer = setInterval(() => {
    if (target.value <= 1) {
      clearCooldown(kind)
      return
    }
    target.value -= 1
  }, 1000)

  if (kind === 'loginCode') {
    loginCodeTimer = timer
  } else if (kind === 'register') {
    registerTimer = timer
  } else {
    twoFactorTimer = timer
  }
}

function clearCooldown(kind: 'loginCode' | 'register' | 'twoFactor') {
  if (kind === 'loginCode' && loginCodeTimer) {
    clearInterval(loginCodeTimer)
    loginCodeTimer = null
    loginCodeCooldown.value = 0
  }
  if (kind === 'register' && registerTimer) {
    clearInterval(registerTimer)
    registerTimer = null
    registerCooldown.value = 0
  }
  if (kind === 'twoFactor' && twoFactorTimer) {
    clearInterval(twoFactorTimer)
    twoFactorTimer = null
    twoFactorCooldown.value = 0
  }
}

function normalizePhone(value: string) {
  const normalized = value.trim().replace(/[()\s-]/g, '')
  return phonePattern.test(normalized) ? normalized : ''
}

function showTextToast(title: string) {
  uni.showToast({
    title,
    icon: 'none',
    duration: 2500,
  })
}
</script>

<style scoped lang="scss">
.login-page {
  display: grid;
  place-items: center;
}

.login-card {
  width: 100%;
  padding: 36rpx;
  display: grid;
  gap: 24rpx;
}

.eyebrow {
  color: #0f766e;
  font-size: 24rpx;
  font-weight: 700;
}

.title {
  font-size: 42rpx;
  font-weight: 700;
  line-height: 1.28;
}

.hint {
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.5;
}

.hint--warning {
  color: #b45309;
}

.mode-switch,
.channel-switch {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.mode-btn,
.channel-btn,
.code-btn,
.captcha-btn {
  margin: 0;
  border: none;
}

.mode-btn,
.channel-btn {
  padding: 0 28rpx;
  min-width: 0;
  height: 72rpx;
  border-radius: 999rpx;
  background: rgba(15, 23, 42, 0.08);
  color: #475569;
  font-size: 26rpx;
  line-height: 72rpx;
}

.mode-btn::after,
.channel-btn::after,
.code-btn::after,
.captcha-btn::after,
.action-btn::after {
  border: none;
}

.mode-btn--active,
.channel-btn--active {
  background: #0f766e;
  color: #ffffff;
}

.panel {
  display: grid;
  gap: 24rpx;
}

.field {
  display: grid;
  gap: 10rpx;
}

.field input {
  padding: 24rpx;
  border-radius: 24rpx;
  background: rgba(244, 247, 252, 0.92);
}

.code-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16rpx;
}

.code-btn {
  padding: 0 24rpx;
  border-radius: 24rpx;
  background: rgba(15, 118, 110, 0.12);
  color: #0f766e;
  font-size: 24rpx;
  line-height: 88rpx;
}

.captcha-btn {
  width: 220rpx;
  height: 88rpx;
  border-radius: 24rpx;
  background: #f8fbff;
  border: 2rpx solid #d7e3f4;
  overflow: hidden;
  display: grid;
  place-items: center;
  color: #64748b;
  font-size: 24rpx;
}

.captcha-image {
  width: 100%;
  height: 100%;
}

.code-btn[disabled],
.captcha-btn[disabled],
.action-btn[disabled] {
  opacity: 0.55;
}

.action-btn {
  margin: 0;
  height: 88rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #ffffff;
  font-size: 28rpx;
  line-height: 88rpx;
}
</style>
