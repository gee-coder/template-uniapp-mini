<template>
  <view class="page-shell login-page">
    <view class="card login-card">
      <text class="eyebrow">Miniapp login</text>
      <text class="title">Use the shared JWT flow across admin and miniapp.</text>
      <view class="field">
        <text>Username</text>
        <input v-model="form.username" placeholder="admin" />
      </view>
      <view class="field">
        <text>Password</text>
        <input v-model="form.password" password placeholder="Admin123!" />
      </view>
      <button class="action-btn" :disabled="loading" @click="submit">{{ loading ? 'Signing in...' : 'Sign in' }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const loading = ref(false)
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
      title: error instanceof Error ? error.message : 'Login failed',
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

.field input {
  padding: 24rpx;
  border-radius: 24rpx;
  background: rgba(244, 247, 252, 0.9);
}
</style>
