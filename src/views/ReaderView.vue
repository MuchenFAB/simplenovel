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
</script>

<template>
  <div v-if="novel" class="reader">
    <button class="btn-back" @click="goBack">← 返回作品列表</button>

    <div class="novel-info">
      <h1>{{ novel.title }}</h1>
      <p class="author">作者：{{ novel.author }}</p>
      <p class="meta">共 {{ novel.chapters.length }} 章 · 最后更新：{{ new Date(novel.updatedAt).toLocaleDateString('zh-CN') }}</p>
    </div>

    <div class="chapter-list">
      <h2>📖 目录</h2>
      <div v-if="novel.chapters.length === 0" class="empty-chapters">
        <p>暂无章节</p>
      </div>
      <div
        v-for="(chapter, index) in novel.chapters"
        :key="chapter.id"
        class="chapter-item"
        @click="openChapter(chapter.id)"
      >
        <span class="chapter-index">{{ index + 1 }}.</span>
        <span class="chapter-title">{{ chapter.title }}</span>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <p>作品不存在或已被删除</p>
    <button class="btn-back" @click="goBack">← 返回首页</button>
  </div>
</template>

<style scoped>
.reader {
  max-width: 700px;
  margin: 0 auto;
}

.btn-back {
  background: none;
  border: none;
  color: #4a90d9;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  margin-bottom: 16px;
}

.novel-info {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.novel-info h1 {
  font-size: 28px;
  margin: 0 0 8px;
}

.author {
  color: #666;
  margin: 0 0 4px;
}

.meta {
  color: #999;
  font-size: 13px;
  margin: 0;
}

.chapter-list h2 {
  font-size: 18px;
  margin: 0 0 12px;
}

.chapter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.chapter-item:hover {
  background: #f7f9fc;
}

.chapter-index {
  color: #999;
  min-width: 30px;
}

.chapter-title {
  color: #333;
}

.empty-chapters {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.not-found {
  text-align: center;
  padding: 80px 0;
  color: #999;
}
</style>