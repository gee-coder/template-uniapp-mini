<template>
  <view class="page-shell home-page">
    <view class="card hero">
      <text class="eyebrow">Miniapp shell</text>
      <text class="title">A ready starting point for WeChat and Douyin delivery.</text>
      <text class="copy">
        This template shares the same auth payload and response envelope as the backend and admin console.
      </text>
    </view>

    <view class="metrics">
      <view v-for="item in metrics" :key="item.label" class="card metric">
        <text class="metric-value">{{ item.value }}</text>
        <text class="metric-label">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

const metrics = computed(() => [
  { label: 'Auth mode', value: 'JWT' },
  { label: 'Current user', value: authStore.profile?.nickname || 'Guest' },
  { label: 'Shared repos', value: '4' },
])
</script>

<style scoped lang="scss">
.home-page {
  display: grid;
  gap: 24rpx;
}

.hero,
.metric {
  padding: 32rpx;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
}

.eyebrow {
  color: #0f766e;
  font-size: 24rpx;
  font-weight: 700;
}

.title {
  margin-top: 16rpx;
  font-size: 40rpx;
  font-weight: 700;
}

.copy,
.metric-label {
  margin-top: 12rpx;
  color: #64748b;
}

.metric-value {
  font-size: 38rpx;
  font-weight: 700;
}
</style>

