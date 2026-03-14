<template>
  <view class="page-shell user-page">
    <view class="card profile-card">
      <text class="title">我的资料</text>
      <text class="line">昵称：{{ authStore.profile?.nickname || '-' }}</text>
      <text class="line">用户名：{{ authStore.profile?.username || '-' }}</text>
      <text class="line">角色：{{ authStore.profile?.roles?.join('、') || '-' }}</text>
      <text class="line">权限：{{ authStore.profile?.permissions?.join('、') || '-' }}</text>
      <button class="action-btn action-btn--danger" @click="authStore.logout()">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

onShow(async () => {
  if (!authStore.isLoggedIn) {
    uni.reLaunch({ url: '/pages/login/index' })
    return
  }

  if (!authStore.profile) {
    await authStore.fetchProfile()
  }
})
</script>

<style scoped lang="scss">
.profile-card {
  padding: 32rpx;
  display: grid;
  gap: 18rpx;
}

.title {
  font-size: 38rpx;
  font-weight: 700;
}

.line {
  color: #475569;
}
</style>
