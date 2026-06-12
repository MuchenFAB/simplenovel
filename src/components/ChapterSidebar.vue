<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Chapter } from '@/types'

const props = defineProps<{
  chapters: Chapter[]
  novelId: string
  currentChapterId: string
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', chapterId: string): void
}>()

const sortedChapters = computed(() =>
  [...props.chapters].map((c, i) => ({ ...c, index: i + 1 }))
)

function selectChapter(chapterId: string) {
  emit('select', chapterId)
}
</script>

<template>
  <aside class="sidebar" :class="{ open: open }">
    <div class="sidebar-header">
      <span class="sidebar-title">📑 目录</span>
      <button class="sidebar-close" @click="emit('close')">✕</button>
    </div>
    <div class="sidebar-list">
      <button
        v-for="ch in sortedChapters"
        :key="ch.id"
        class="sidebar-item"
        :class="{ active: ch.id === currentChapterId }"
        @click="selectChapter(ch.id)"
      >
        <span class="sidebar-index">{{ ch.index }}.</span>
        <span class="sidebar-chapter">{{ ch.title }}</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: var(--vp-nav-height);
  left: 0;
  width: 260px;
  height: calc(100vh - var(--vp-nav-height));
  background: var(--vp-c-bg);
  border-right: 1px solid var(--vp-c-border);
  z-index: 90;
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    background 0.3s ease,
    border-color 0.3s ease;
  overflow: hidden;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--vp-c-border);
  transition: border-color 0.3s ease;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text);
  transition: color 0.3s ease;
}

.sidebar-close {
  background: none;
  border: none;
  font-size: 16px;
  color: var(--vp-c-text-lighter);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--vp-radius-sm);
  line-height: 1;
  transition: color 0.3s ease, background 0.3s ease;
}

.sidebar-close:hover {
  color: var(--vp-c-text);
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  color: var(--vp-c-text-light);
  transition: background 0.15s, color 0.15s;
}

.sidebar-item:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-brand);
}

.sidebar-item.active {
  background: rgba(62, 175, 124, 0.1);
  color: var(--vp-c-brand);
  font-weight: 600;
}

.sidebar-index {
  color: var(--vp-c-text-lighter);
  min-width: 22px;
}

.sidebar-item.active .sidebar-index {
  color: var(--vp-c-brand);
}

/* 宽屏时默认展开 */
@media (min-width: 1024px) {
  .sidebar {
    transform: translateX(0);
  }
  .sidebar-close {
    display: none;
  }
}
</style>