<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore, type ThemeMode } from '@/stores/theme'

const router = useRouter()
const themeStore = useThemeStore()

const themeLabel = computed(() => {
  const map: Record<ThemeMode, string> = {
    light: '🌙',
    dark: '🌿',
    'eye-care': '☀️',
  }
  return map[themeStore.mode]
})

const themeTitle = computed(() => {
  const map: Record<ThemeMode, string> = {
    light: '切换暗色模式',
    dark: '切换护眼模式',
    'eye-care': '切换浅色模式',
  }
  return map[themeStore.mode]
})

function goHome() {
  router.push('/')
}

function goEditor() {
  router.push('/editor')
}

function toggleTheme() {
  themeStore.cycle()
}
</script>

<template>
  <header class="vp-navbar">
    <div class="vp-navbar-inner">
      <div class="vp-nav-left">
        <button class="vp-site-name" @click="goHome">
          📖 SimpleNovel
        </button>
      </div>

      <nav class="vp-nav-right">
        <button class="vp-nav-link" @click="goHome">书架</button>
        <button class="vp-nav-link" @click="goEditor">创作</button>
        <button
          class="vp-theme-btn"
          :title="themeTitle"
          @click="toggleTheme"
        >
          {{ themeLabel }}
        </button>
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
  transition: var(--vp-transition);
}

.vp-navbar-inner {
  max-width: var(--vp-content-max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.vp-nav-left {
  display: flex;
  align-items: center;
}

.vp-site-name {
  background: none;
  border: none;
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text);
  padding: 0;
  letter-spacing: -0.3px;
  transition: color 0.2s;
}

.vp-site-name:hover {
  color: var(--vp-c-brand);
}

.vp-nav-right {
  display: flex;
  align-items: center;
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

/* ===== 主题切换按钮 ===== */
.vp-theme-btn {
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-border);
  font-size: 16px;
  width: 36px;
  height: 36px;
  border-radius: var(--vp-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  margin-left: 8px;
  line-height: 1;
}

.vp-theme-btn:hover {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-bg-mute);
  transform: scale(1.1);
}

.vp-theme-btn:active {
  transform: scale(0.95);
}
</style>