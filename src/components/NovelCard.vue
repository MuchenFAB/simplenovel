<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Novel } from '@/types'

const props = defineProps<{
  novel: Novel
}>()

const router = useRouter()

function openNovel() {
  router.push(`/read/${props.novel.id}`)
}

function editNovel(e: MouseEvent) {
  e.stopPropagation()
  router.push(`/editor/${props.novel.id}`)
}
</script>

<template>
  <div class="vp-card" @click="openNovel">
    <div class="vp-card-body">
      <h3 class="vp-card-title">{{ novel.title }}</h3>
      <p class="vp-card-author">{{ novel.author }}</p>
      <p class="vp-card-meta">
        {{ novel.chapters.length }} 章 · {{ new Date(novel.updatedAt).toLocaleDateString('zh-CN') }}
      </p>
    </div>
    <div class="vp-card-footer">
      <button class="vp-card-action primary">阅读</button>
      <button class="vp-card-action" @click="editNovel">编辑</button>
    </div>
  </div>
</template>

<style scoped>
.vp-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: var(--vp-radius);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.vp-card:hover {
  box-shadow: var(--vp-c-shadow);
  border-color: var(--vp-c-brand-lighter);
  transform: translateY(-2px);
}

.vp-card-body {
  padding: 20px 20px 12px;
}

.vp-card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text);
  margin: 0 0 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vp-card-author {
  font-size: 13px;
  color: var(--vp-c-text-lighter);
  margin: 0 0 6px;
}

.vp-card-meta {
  font-size: 12px;
  color: var(--vp-c-text-lighter);
  margin: 0;
}

.vp-card-footer {
  display: flex;
  border-top: 1px solid var(--vp-c-border);
}

.vp-card-action {
  flex: 1;
  padding: 10px 0;
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: var(--vp-c-text-light);
  transition: background 0.2s, color 0.2s;
}

.vp-card-action:first-child {
  border-right: 1px solid var(--vp-c-border);
}

.vp-card-action.primary {
  color: var(--vp-c-brand);
}

.vp-card-action:hover {
  background: var(--vp-c-bg-mute);
}

.vp-card-action.primary:hover {
  background: #e8f8f0;
  color: var(--vp-c-brand-dark);
}
</style>