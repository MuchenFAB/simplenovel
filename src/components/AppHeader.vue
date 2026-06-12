<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}

function goEditor() {
  router.push('/editor')
}
</script>

<template>
  <header class="vp-navbar">
    <div class="vp-navbar-inner">
      <button class="vp-site-name" @click="goHome">
        📖 SimpleNovel
      </button>
      <nav class="vp-nav-links">
        <button class="vp-nav-link" @click="goHome">书架</button>
        <button class="vp-nav-link" @click="goEditor">创作</button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.vp-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--vp-nav-height);
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-border);
  padding: 0 24px;
}

.vp-navbar-inner {
  max-width: var(--vp-content-max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.vp-site-name {
  background: none;
  border: none;
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text);
  padding: 0;
  letter-spacing: -0.3px;
}

.vp-site-name:hover {
  color: var(--vp-c-brand);
}

.vp-nav-links {
  display: flex;
  gap: 4px;
}

.vp-nav-link {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-light);
  padding: 6px 14px;
  border-radius: var(--vp-radius-sm);
  transition: color 0.2s, background 0.2s;
}

.vp-nav-link:hover {
  color: var(--vp-c-brand);
  background: var(--vp-c-bg-mute);
}
</style>