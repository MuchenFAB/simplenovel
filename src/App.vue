<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useThemeStore } from '@/stores/theme'
import { siteConfig } from '@/config'
import footbarRaw from '../footbar.md?raw'
import { computed } from 'vue'

// 初始化主题
useThemeStore()

// 解析 footbar (当 enableFootbar 为 true)
const footbarLines = computed(() => {
  if (!siteConfig.enableFootbar) return []
  return footbarRaw
    .replace(/\r/g, '')
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      if (line.startsWith('# ')) {
        return { type: 'h1', text: line.slice(2) }
      }
      if (line.trimStart().startsWith('- ')) {
        return { type: 'li', text: line.trimStart().slice(2) }
      }
      if (line.trimStart().startsWith('> ')) {
        return { type: 'quote', text: line.trimStart().slice(2) }
      }
      return { type: 'p', text: line }
    })
})
</script>

<template>
  <div class="vp-layout">
    <AppHeader />
    <main class="vp-page">
      <RouterView />
    </main>
    <!-- 全局底栏（由 enableFootbar 开关控制） -->
    <footer v-if="footbarLines.length > 0" class="vp-footbar">
      <div class="vp-footbar-inner">
        <template v-for="(line, i) in footbarLines" :key="i">
          <strong v-if="line.type === 'h1'" class="footbar-h1">{{ line.text }}</strong>
          <span v-else-if="line.type === 'li'" class="footbar-li">{{ line.text }}</span>
          <em v-else-if="line.type === 'quote'" class="footbar-quote">{{ line.text }}</em>
          <span v-else class="footbar-p">{{ line.text }}</span>
        </template>
      </div>
    </footer>
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
  padding: 32px 24px 64px;
}

@media (max-width: 768px) {
  .vp-page {
    padding: 24px 16px 64px;
  }
}

/* ===== 全局底栏 ===== */
.vp-footbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--vp-c-bg);
  border-top: 1px solid var(--vp-c-border);
  z-index: 95;
  padding: 8px 0;
  transition: var(--vp-transition);
}

.vp-footbar-inner {
  max-width: var(--vp-content-max-width);
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px 16px;
  font-size: 12px;
  color: var(--vp-c-text-lighter);
}

.footbar-h1 {
  color: var(--vp-c-text);
  font-size: 12px;
  width: 100%;
  text-align: center;
  margin-bottom: 2px;
}

.footbar-li {
  display: inline-block;
  color: var(--vp-c-text-light);
}

.footbar-quote {
  color: var(--vp-c-text-lighter);
  font-style: normal;
}

.footbar-p {
  color: var(--vp-c-text-lighter);
}
</style>