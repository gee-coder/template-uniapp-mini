<template>
  <view class="page-shell login-page">
    <view class="card login-card">
      <text class="eyebrow">统一认证模板</text>
      <text class="title">支持用户名、邮箱、手机号登录注册，并为手机号接入短信验证码。</text>
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
          <text>{{ loginLabel }}</text>
          <input v-model="loginForm.account" :placeholder="loginPlaceholder" />
        </view>
        <view class="field">
          <text>密码</text>
          <input v-model="loginForm.password" password placeholder="至少 6 位" />
        </view>
        <view v-if="loginNeedsSMS" class="field">
          <text>短信验证码</text>
          <view class="sms-row">
            <input v-model="loginForm.smsCode" placeholder="请输入短信验证码" maxlength="8" />
            <button class="sms-btn" :disabled="loading || loginCooldown > 0" @click="sendSMSCode('login')">
              {{ loginCooldown > 0 ? `${loginCooldown}s` : '发送验证码' }}
            </button>
          </view>
        </view>
        <button class="action-btn" :disabled="loading" @click="submitLogin">
          {{ loading ? '登录中...' : '立即登录' }}
        </button>
        <text class="hint">{{ loginNeedsSMS ? '手机号登录需要同时校验密码和短信验证码。' : '演示账号：admin / Admin123!' }}</text>
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
          <text>{{ registerLabel }}</text>
          <input v-model="registerForm.account" :placeholder="registerPlaceholder" />
        </view>
        <view class="field">
          <text>昵称</text>
          <input v-model="registerForm.nickname" placeholder="可选，不填则自动生成" />
        </view>
        <view v-if="registerNeedsSMS" class="field">
          <text>短信验证码</text>
          <view class="sms-row">
            <input v-model="registerForm.smsCode" placeholder="请输入短信验证码" maxlength="8" />
            <button class="sms-btn" :disabled="loading || registerCooldown > 0" @click="sendSMSCode('register')">
              {{ registerCooldown > 0 ? `${registerCooldown}s` : '发送验证码' }}
            </button>
          </view>
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
        <text class="hint">
          {{ registerNeedsSMS ? '手机号注册需要先完成短信验证码校验。' : '注册入口会根据 /auth/options 配置动态变化。' }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { API_BASE_URL, API_BASE_URL_DEVICE_HINT } from '@/common/constants'
import {
  getAuthOptionsApi,
  sendSMSCodeApi,
  type AuthLoginType,
  type AuthOptions,
  type AuthRegisterType,
} from '@/api/auth'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const loading = ref(false)
const apiBaseUrl = API_BASE_URL
const deviceHint = API_BASE_URL_DEVICE_HINT

const fallbackOptions: AuthOptions = {
  enableUsernameLogin: true,
  enableEmailLogin: true,
  enablePhoneLogin: true,
  enableEmailRegistration: true,
  enablePhoneRegistration: true,
}

const options = ref<AuthOptions>(fallbackOptions)
const mode = ref<'login' | 'register'>('login')
const loginType = ref<AuthLoginType>('username')
const registerType = ref<AuthRegisterType>('email')
const loginCooldown = ref(0)
const registerCooldown = ref(0)

const loginForm = reactive({
  account: 'admin',
  password: 'Admin123!',
  smsCode: '',
})

const registerForm = reactive({
  account: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  smsCode: '',
})

let loginTimer: ReturnType<typeof setInterval> | null = null
let registerTimer: ReturnType<typeof setInterval> | null = null

const loginTabs = computed(() => {
  const tabs: Array<{ value: AuthLoginType; label: string }> = []
  if (options.value.enableUsernameLogin) tabs.push({ value: 'username', label: '用户名' })
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

const loginLabel = computed(() => {
  switch (loginType.value) {
    case 'email':
      return '邮箱'
    case 'phone':
      return '手机号'
    default:
      return '用户名'
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

const registerLabel = computed(() => (registerType.value === 'email' ? '邮箱' : '手机号'))
const registerPlaceholder = computed(() => (registerType.value === 'email' ? 'name@example.com' : '18800000000'))
const loginNeedsSMS = computed(() => loginType.value === 'phone')
const registerNeedsSMS = computed(() => registerType.value === 'phone')

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

watch(loginNeedsSMS, (value) => {
  if (!value) {
    loginForm.smsCode = ''
    clearCooldown('login')
  }
})

watch(registerNeedsSMS, (value) => {
  if (!value) {
    registerForm.smsCode = ''
    clearCooldown('register')
  }
})

onMounted(async () => {
  try {
    options.value = await getAuthOptionsApi()
  } catch {
    uni.showToast({
      title: '认证配置读取失败，已使用默认展示',
      icon: 'none',
    })
  }
})

onUnmounted(() => {
  clearCooldown('login')
  clearCooldown('register')
})

async function submitLogin() {
  if (!loginForm.account || !loginForm.password) {
    uni.showToast({ title: '请先填写完整账号和密码', icon: 'none' })
    return
  }
  if (loginNeedsSMS.value && !loginForm.smsCode.trim()) {
    uni.showToast({ title: '请先输入短信验证码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    await authStore.login({
      account: loginForm.account.trim(),
      password: loginForm.password,
      loginType: loginType.value,
      smsCode: loginNeedsSMS.value ? loginForm.smsCode.trim() : undefined,
    })
    uni.switchTab({ url: '/pages/index/index' })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '登录失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

async function submitRegister() {
  if (!registerTabs.value.length) {
    uni.showToast({ title: '当前没有开放注册方式', icon: 'none' })
    return
  }
  if (!registerForm.account || !registerForm.password) {
    uni.showToast({ title: '请先填写完整注册信息', icon: 'none' })
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return
  }
  if (registerNeedsSMS.value && !registerForm.smsCode.trim()) {
    uni.showToast({ title: '请先输入短信验证码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    await authStore.register({
      account: registerForm.account.trim(),
      nickname: registerForm.nickname.trim(),
      password: registerForm.password,
      registerType: registerType.value,
      smsCode: registerNeedsSMS.value ? registerForm.smsCode.trim() : undefined,
    })
    uni.switchTab({ url: '/pages/index/index' })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '注册失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

async function sendSMSCode(kind: 'login' | 'register') {
  const phone = kind === 'login' ? normalizePhone(loginForm.account) : normalizePhone(registerForm.account)
  if (!phone) {
    uni.showToast({ title: '请先输入有效手机号', icon: 'none' })
    return
  }

  try {
    const payload = await sendSMSCodeApi({ phone, purpose: kind })
    if (kind === 'login' && payload.debugCode) {
      loginForm.smsCode = payload.debugCode
    }
    if (kind === 'register' && payload.debugCode) {
      registerForm.smsCode = payload.debugCode
    }
    startCooldown(kind, payload.cooldownIn || 60)
    uni.showToast({
      title: payload.debugCode ? `验证码：${payload.debugCode}` : '验证码已发送',
      icon: 'none',
      duration: 2500,
    })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '验证码发送失败',
      icon: 'none',
    })
  }
}

function startCooldown(kind: 'login' | 'register', seconds: number) {
  clearCooldown(kind)
  const target = kind === 'login' ? loginCooldown : registerCooldown
  target.value = Math.max(0, Math.round(seconds))

  const timer = setInterval(() => {
    if (target.value <= 1) {
      clearCooldown(kind)
      return
    }
    target.value -= 1
  }, 1000)

  if (kind === 'login') {
    loginTimer = timer
  } else {
    registerTimer = timer
  }
}

function clearCooldown(kind: 'login' | 'register') {
  if (kind === 'login' && loginTimer) {
    clearInterval(loginTimer)
    loginTimer = null
    loginCooldown.value = 0
  }
  if (kind === 'register' && registerTimer) {
    clearInterval(registerTimer)
    registerTimer = null
    registerCooldown.value = 0
  }
}

function normalizePhone(value: string) {
  const normalized = value.trim().replace(/[()\s-]/g, '')
  return /^\+?[0-9]{6,20}$/.test(normalized) ? normalized : ''
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
.channel-btn {
  margin: 0;
  padding: 0 28rpx;
  min-width: 0;
  height: 72rpx;
  border-radius: 999rpx;
  border: none;
  background: rgba(15, 23, 42, 0.08);
  color: #475569;
  font-size: 26rpx;
  line-height: 72rpx;
}

.mode-btn::after,
.channel-btn::after,
.sms-btn::after {
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

.sms-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16rpx;
}

.sms-btn {
  margin: 0;
  padding: 0 24rpx;
  border: none;
  border-radius: 24rpx;
  background: rgba(15, 118, 110, 0.12);
  color: #0f766e;
  font-size: 24rpx;
  line-height: 88rpx;
}

.sms-btn[disabled] {
  opacity: 0.55;
}
</style>
