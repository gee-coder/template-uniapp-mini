<template>
  <view class="page-shell login-page">
    <view class="card login-card">
      <text class="eyebrow">统一认证模板</text>
      <text class="title">同一套小程序模板，同时支持用户名、手机号、邮箱认证。</text>
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
        <button class="action-btn" :disabled="loading" @click="submitLogin">
          {{ loading ? '登录中...' : '立即登录' }}
        </button>
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
        <text class="hint">注册入口会根据后端 `/auth/options` 配置动态变化。</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { getAuthOptionsApi, type AuthLoginType, type AuthOptions, type AuthRegisterType } from '@/api/auth'
import { useAuthStore } from '@/store/auth'
import { API_BASE_URL, API_BASE_URL_DEVICE_HINT } from '@/common/constants'

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

const loginForm = reactive({
  account: 'admin',
  password: 'Admin123!',
})

const registerForm = reactive({
  account: '',
  nickname: '',
  password: '',
  confirmPassword: '',
})

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

const registerPlaceholder = computed(() => (registerType.value === 'email' ? 'name@example.com' : '18800000000'))
const registerLabel = computed(() => (registerType.value === 'email' ? '邮箱' : '手机号'))

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

async function submitLogin() {
  if (!loginForm.account || !loginForm.password) {
    uni.showToast({ title: '请先填写完整账号和密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    await authStore.login({
      account: loginForm.account.trim(),
      password: loginForm.password,
      loginType: loginType.value,
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

  loading.value = true
  try {
    await authStore.register({
      account: registerForm.account.trim(),
      nickname: registerForm.nickname.trim(),
      password: registerForm.password,
      registerType: registerType.value,
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
.channel-btn::after {
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
</style>
