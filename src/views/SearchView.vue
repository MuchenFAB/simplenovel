<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNovelStore } from '@/stores/novel'
import type { Novel, Chapter } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useNovelStore()

const query = ref((route.query.q as string) || '')
const searchInput = ref<HTMLInputElement | null>(null)

// 搜索结果
interface SearchResult {
  novel: Novel
  matchedTitle: boolean
  matchedAuthor: boolean
  matchedChapters: Chapter[]
}

const results = computed<SearchResult[]>(() => {
  const q = query.value.trim().toLowerCase()
  if (!q || q.length < 1) return []

  return store.novels
    .map((novel) => {
      const matchedTitle = novel.title.toLowerCase().includes(q)
      const matchedAuthor = novel.author.toLowerCase().includes(q)
      const matchedChapters = novel.chapters.filter((ch) =>
        ch.title.toLowerCase().includes(q) || ch.content.toLowerCase().includes(q)
      )
      return { novel, matchedTitle, matchedAuthor, matchedChapters }
    })
    .filter(
      (r) => r.matchedTitle || r.matchedAuthor || r.matchedChapters.length > 0
    )
})

const resultCount = computed(() => results.value.length)

function doSearch() {
  const q = query.value.trim()
  if (q) {
    router.replace({ query: { q } })
  }
}

function clearSearch() {
  query.value = ''
  router.replace({ query: {} })
  searchInput.value?.focus()
}

function openNovel(novelId: string) {
  router.push(`/read/${novelId}`)
}

function openChapter(novelId: string, chapterId: string) {
  router.push(`/read/${novelId}/${chapterId}`)
}

// 监听 URL query 变化
watch(
  () => route.query.q,
  (val) => {
    if (val && typeof val === 'string') {
      query.value = val
    }
  }
)
</script>

<template>
  <div class="search-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <input
        ref="searchInput"
        v-model="query"
        type="text"
        class="search-input"
        placeholder="搜索小说名, 作者, 章节..."
        @keyup.enter="doSearch"
      />
      <button class="search-btn" @click="doSearch">搜索</button>
      <button v-if="query" class="search-clear" @click="clearSearch">✕</button>
    </div>

    <!-- 搜索结果 -->
    <div v-if="query && resultCount > 0" class="search-results">
      <p class="result-summary">找到 {{ resultCount }} 个相关作品</p>

      <div
        v-for="r in results"
        :key="r.novel.id"
        class="result-card"
      >
        <div class="result-header" @click="openNovel(r.novel.id)">
          <h3 class="result-title">
            {{ r.novel.title }}
            <span v-if="r.matchedTitle" class="match-badge">书名匹配</span>
          </h3>
          <p class="result-author">
            {{ r.novel.author }}
            <span v-if="r.matchedAuthor" class="match-badge">作者匹配</span>
          </p>
        </div>

        <!-- 匹配的章节 -->
        <div v-if="r.matchedChapters.length > 0" class="matched-chapters">
          <div
            v-for="ch in r.matchedChapters"
            :key="ch.id"
            class="chapter-match"
            @click="openChapter(r.novel.id, ch.id)"
          >
            <span class="chapter-icon">📄</span>
            <span class="chapter-name">{{ ch.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 无结果 -->
    <div v-else-if="query && resultCount === 0" class="search-empty">
      <p>未找到匹配的结果, 换个关键词试试</p>
    </div>

    <!-- 空状态 -->
    <div v-else class="search-hint">
      <p>输入关键词搜索小说名, 作者或章节内容</p>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  max-width: 720px;
  margin: 0 auto;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid var(--vp-c-border);
  border-radius: var(--vp-radius);
  font-size: 15px;
  font-family: inherit;
  color: var(--vp-c-text);
  background: var(--vp-c-bg);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  border-color: var(--vp-c-brand);
  box-shadow: 0 0 0 3px rgba(62, 175, 124, 0.15);
}

.search-input::placeholder {
  color: var(--vp-c-text-lighter);
}

.search-btn {
  padding: 10px 20px;
  background: var(--vp-c-brand);
  color: #fff;
  border: none;
  border-radius: var(--vp-radius);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn:hover {
  background: var(--vp-c-brand-dark);
}

.search-clear {
  padding: 10px 12px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-border);
  border-radius: var(--vp-radius);
  color: var(--vp-c-text-lighter);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.search-clear:hover {
  color: var(--vp-c-text);
  border-color: var(--vp-c-text-lighter);
}

/* 结果统计 */
.result-summary {
  font-size: 14px;
  color: var(--vp-c-text-lighter);
  margin-bottom: 16px;
}

/* 结果卡片 */
.result-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: var(--vp-radius);
  padding: 16px 20px;
  margin-bottom: 12px;
  transition: box-shadow 0.2s;
}

.result-card:hover {
  box-shadow: var(--vp-c-shadow-sm);
}

.result-header {
  cursor: pointer;
}

.result-header:hover .result-title {
  color: var(--vp-c-brand);
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text);
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s;
}

.result-author {
  font-size: 13px;
  color: var(--vp-c-text-lighter);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.match-badge {
  display: inline-block;
  padding: 1px 8px;
  background: rgba(62, 175, 124, 0.12);
  color: var(--vp-c-brand);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

/* 匹配章节 */
.matched-chapters {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--vp-c-border);
}

.chapter-match {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: var(--vp-radius-sm);
  cursor: pointer;
  transition: background 0.15s;
}

.chapter-match:hover {
  background: var(--vp-c-bg-mute);
}

.chapter-icon {
  font-size: 13px;
}

.chapter-name {
  font-size: 13px;
  color: var(--vp-c-text-light);
}

.chapter-match:hover .chapter-name {
  color: var(--vp-c-brand);
}

/* 空/提示状态 */
.search-empty,
.search-hint {
  text-align: center;
  padding: 60px 20px;
  color: var(--vp-c-text-lighter);
  font-size: 14px;
}
</style>