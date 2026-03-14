<template>
  <view class="page-shell home-page">
    <view class="card hero">
      <text class="eyebrow">小程序底座</text>
      <text class="title">先把微信小程序跑顺，再在这套底座上继续叠业务。</text>
      <text class="copy">
        当前模板已经和后端、管理后台对齐同一套响应结构与鉴权协议，联调时会更省心。
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
import { API_BASE_URL_SOURCE } from '@/common/constants'

const authStore = useAuthStore()

const metrics = computed(() => [
  { label: '鉴权模式', value: '令牌鉴权' },
  { label: '当前用户', value: authStore.profile?.nickname || '游客' },
  { label: '接口来源', value: API_BASE_URL_SOURCE === 'env' ? '自定义配置' : '本机地址' },
  { label: '协同仓库', value: '4' },
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
