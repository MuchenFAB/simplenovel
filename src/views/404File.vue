<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <div class="nf-card">
      <div class="nf-icon">📖</div>
      <h1 class="nf-code">404</h1>
      <p class="nf-title">Page not found</p>
      <p class="nf-desc">此页面似乎有问题</p>
      <div class="nf-actions">
        <button class="nf-btn nf-btn--primary" @click="goHome">
          返回首页
        </button>
        <button class="nf-btn" @click="router.back()">
          返回上页
        </button>
      </div>
      <p class="nf-hint">
         正在寻找某本小说?回到书架上找找吧!
      </p>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--vp-nav-height) - 128px);
  padding: 40px 20px;
}

.nf-card {
  text-align: center;
  max-width: 480px;
  width: 100%;
  padding: 48px 32px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
  box-shadow: var(--vp-c-shadow);
  transition: var(--vp-transition);
}

.nf-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.nf-code {
  font-size: 96px;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-brand);
  margin: 0 0 8px;
  letter-spacing: -4px;
  background: linear-gradient(135deg, var(--vp-c-brand), var(--vp-c-brand-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nf-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--vp-c-text);
  margin: 0 0 8px;
}

.nf-desc {
  font-size: 14px;
  color: var(--vp-c-text-lighter);
  margin: 0 0 32px;
  line-height: 1.6;
}

.nf-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.nf-btn {
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text);
  border: 1px solid var(--vp-c-border);
}

.nf-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
  background: var(--vp-c-bg);
}

.nf-btn--primary {
  background: var(--vp-c-brand);
  color: #fff;
  border: none;
}

.nf-btn--primary:hover {
  background: var(--vp-c-brand-dark);
  color: #fff;
  transform: translateY(-1px);
}

.nf-btn--primary:active {
  transform: translateY(0);
}

.nf-hint {
  font-size: 12px;
  color: var(--vp-c-text-lighter);
  margin: 0;
}

@media (max-width: 480px) {
  .nf-card {
    padding: 36px 20px;
  }
  .nf-code {
    font-size: 72px;
  }
  .nf-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>