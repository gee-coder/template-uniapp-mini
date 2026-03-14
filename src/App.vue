<template>
  <slot />
</template>

<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('Nex Miniapp launched')
})
</script>

<style lang="scss">
page {
  min-height: 100%;
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.12), transparent 28%),
    linear-gradient(180deg, #f8fafc 0%, #edf4fb 100%);
  color: #162033;
  font-family: "Segoe UI", sans-serif;
}

.card {
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16rpx 38rpx rgba(15, 23, 42, 0.08);
}

.page-shell {
  min-height: 100vh;
  padding: 32rpx;
}

.action-btn {
  border: none;
  border-radius: 999rpx;
  padding: 24rpx 28rpx;
  color: white;
  font-size: 28rpx;
  font-weight: 700;
  background: linear-gradient(135deg, #0f766e, #0b5d91);
}

.action-btn--danger {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}
</style>
