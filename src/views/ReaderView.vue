<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNovelStore } from '@/stores/novel'

const route = useRoute()
const router = useRouter()
const store = useNovelStore()

const novelId = computed(() => route.params.novelId as string)
const novel = computed(() => store.getNovelById(novelId.value))

function openChapter(chapterId: string) {
  router.push(`/read/${novelId.value}/${chapterId}`)
}

function goBack() {
  router.push('/')
}

function exportPdf() {
  if (novel.value) {
    import('@/utils/exportPdf').then((m) => m.exportNovelPdf(novel.value!))
  }
}
</script>

<template>
  <div v-if="novel" class="vp-content">
    <button class="vp-back-link" @click="goBack">← 返回书架</button>

    <div class="vp-doc-header">
      <h1>{{ novel.title }}</h1>
      <p class="vp-doc-author">作者: {{ novel.author }}</p>
      <p class="vp-doc-meta">共 {{ novel.chapters.length }} 章 - 最后更新: {{ new Date(novel.updatedAt).toLocaleDateString('zh-CN') }}</p>
      <button class="vp-export-btn" @click="exportPdf">📥 导出整本 PDF</button>
    </div>

    <div class="vp-section">
      <h2>📖 目录</h2>
      <div v-if="novel.chapters.length === 0" class="vp-empty">
        <p>暂无章节</p>
      </div>
      <div
        v-for="(chapter, index) in novel.chapters"
        :key="chapter.id"
        class="vp-chapter-item"
        @click="openChapter(chapter.id)"
      >
        <span class="chapter-index">{{ index + 1 }}.</span>
        <span class="chapter-title">{{ chapter.title }}</span>
      </div>
    </div>
  </div>

  <div v-else class="vp-empty">
    <p>作品不存在或已被删除</p>
    <button class="vp-back-link" @click="goBack">← 返回首页</button>
  </div>
</template>

<style scoped>
.vp-content {
  max-width: 720px;
  margin: 0 auto;
}

.vp-back-link {
  display: inline-block;
  background: none;
  border: none;
  color: var(--vp-c-brand);
  font-size: 14px;
  padding: 0;
  margin-bottom: 24px;
  font-weight: 500;
}

.vp-back-link:hover {
  color: var(--vp-c-brand-dark);
  text-decoration: underline;
}

.vp-doc-header {
  margin-bottom: 36px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--vp-c-border);
}

.vp-doc-header h1 {
  font-size: 2rem;
  margin: 0 0 8px;
}

.vp-doc-author {
  color: var(--vp-c-text-light);
  margin: 0 0 4px;
}

.vp-doc-meta {
  color: var(--vp-c-text-lighter);
  font-size: 13px;
  margin: 0 0 12px;
}

.vp-export-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-border);
  padding: 6px 16px;
  border-radius: var(--vp-radius);
  font-size: 13px;
  cursor: pointer;
  color: var(--vp-c-text-light);
  transition: all 0.2s;
}

.vp-export-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
  background: var(--vp-c-bg);
}

.vp-section h2 {
  font-size: 1.3rem;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-border);
}

.vp-chapter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-border);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  border-radius: var(--vp-radius-sm);
}

.vp-chapter-item:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-brand);
}

.chapter-index {
  color: var(--vp-c-text-lighter);
  min-width: 30px;
  font-size: 14px;
}

.chapter-title {
  color: var(--vp-c-text);
  font-size: 15px;
}

.vp-chapter-item:hover .chapter-title {
  color: var(--vp-c-brand);
}

.vp-empty {
  text-align: center;
  padding: 80px 0;
  color: var(--vp-c-text-lighter);
}
</style>