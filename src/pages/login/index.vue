<template>
  <view class="page-shell login-page">
    <view class="card login-card">
      <text class="eyebrow">账号登录</text>
      <text class="title">和后台共用同一套令牌鉴权流程，方便统一联调与后续扩展。</text>
      <text class="hint">接口地址：{{ apiBaseUrl }}</text>
      <text v-if="deviceHint" class="hint hint--warning">{{ deviceHint }}</text>
      <view class="field">
        <text>用户名</text>
        <input v-model="form.username" placeholder="admin" />
      </view>
      <view class="field">
        <text>密码</text>
        <input v-model="form.password" password placeholder="Admin123!" />
      </view>
      <button class="action-btn" :disabled="loading" @click="submit">{{ loading ? '登录中...' : '立即登录' }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import { API_BASE_URL, API_BASE_URL_DEVICE_HINT } from '@/common/constants'

const authStore = useAuthStore()
const loading = ref(false)
const apiBaseUrl = API_BASE_URL
const deviceHint = API_BASE_URL_DEVICE_HINT
const form = reactive({
  username: 'admin',
  password: 'Admin123!',
})

async function submit() {
  loading.value = true
  try {
    await authStore.login(form)
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
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1.2;
}

.field {
  display: grid;
  gap: 10rpx;
}

.hint {
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.5;
}

.hint--warning {
  color: #b45309;
}

.field input {
  padding: 24rpx;
  border-radius: 24rpx;
  background: rgba(244, 247, 252, 0.9);
}
</style>
