<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useThemeStore } from '@/stores/theme'

// 初始化主题（store 内部会自动设置 data-theme 属性）
useThemeStore()
</script>

<template>
  <div class="vp-layout">
    <AppHeader />
    <main class="vp-page">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.vp-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background 0.3s ease;
}

.vp-page {
  flex: 1;
  max-width: var(--vp-content-max-width);
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px;
}

@media (max-width: 768px) {
  .vp-page {
    padding: 24px 16px;
  }
}
</style>