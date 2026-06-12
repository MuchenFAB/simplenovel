<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { siteConfig } from '@/config'
import type { ThemeMode } from '@/stores/theme'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const isReading = computed(() => route.path.startsWith('/read/'))

// Site name from config
const siteName = siteConfig.siteName

// Theme button label mapping
const themeLabel = computed(() => {
  const map: Record<ThemeMode, string> = {
    light: '🌙',
    dark: '🌿',
    'eye-care': '☀️',
  }
  return map[themeStore.mode]
})

// Theme button title (infer next mode from current)
const themeTitle = computed(() => {
  if (themeStore.mode === 'light' && siteConfig.enableDarkMode) return '切换暗色模式'
  if (themeStore.mode === 'light' && siteConfig.enableEyeCareMode) return '切换护眼模式'
  if (themeStore.mode === 'dark' && siteConfig.enableEyeCareMode) return '切换护眼模式'
  if (themeStore.mode === 'dark') return '切换浅色模式'
  if (themeStore.mode === 'eye-care') return '切换浅色模式'
  return ''
})

// Show theme button only when at least two modes available
const showThemeBtn = computed(() => {
  let count = 1 // light always enabled
  if (siteConfig.enableDarkMode) count++
  if (siteConfig.enableEyeCareMode) count++
  return count >= 2
})

function goHome() {
  router.push('/')
}

function goEditor() {
  router.push('/editor')
}

function goSearch() {
  router.push('/search')
}

function goImport() {
  router.push('/import')
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
          {{ siteName }}
        </button>
      </div>

      <nav class="vp-nav-right">
        <template v-if="isReading">
          <button class="vp-nav-link" @click="goHome">← 书架</button>
        </template>
        <template v-else>
          <button class="vp-nav-link" @click="goHome">书架</button>
          <button class="vp-nav-link" @click="goSearch">搜索</button>
          <button class="vp-nav-link" @click="goImport">导入</button>
          <button class="vp-nav-link" @click="goEditor">创作</button>
        </template>
        <button
          v-if="showThemeBtn"
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
  padding: 0 16px;
  transition: var(--vp-transition);
}

@media (min-width: 768px) {
  .vp-navbar {
    padding: 0 24px;
  }
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
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text);
  padding: 0;
  letter-spacing: -0.3px;
  transition: color 0.2s;
}

@media (min-width: 768px) {
  .vp-site-name {
    font-size: 18px;
  }
}

.vp-site-name:hover {
  color: var(--vp-c-brand);
}

.vp-nav-right {
  display: flex;
  align-items: center;
  gap: 2px;
}

@media (min-width: 768px) {
  .vp-nav-right {
    gap: 4px;
  }
}

.vp-nav-link {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-light);
  padding: 6px 10px;
  border-radius: var(--vp-radius-sm);
  transition: color 0.2s, background 0.2s;
}

@media (min-width: 768px) {
  .vp-nav-link {
    font-size: 14px;
    padding: 6px 14px;
  }
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