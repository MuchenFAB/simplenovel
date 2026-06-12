<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNovelStore } from '@/stores/novel'
import { fetchAndParseRss } from '@/utils/rssParser'
import type { RssFeedInfo, RssFeedItem } from '@/utils/rssParser'

const router = useRouter()
const store = useNovelStore()

const rssUrl = ref('')
const loading = ref(false)
const error = ref('')

const feedPreview = ref<RssFeedInfo | null>(null)
const isNewImport = ref(true)
const existingNovelId = ref<string | null>(null)

const hasPreview = computed(() => feedPreview.value !== null)

function goBack() {
  router.push('/')
}

function goToImport() {
  feedPreview.value = null
  isNewImport.value = true
  existingNovelId.value = null
  error.value = ''
}

async function handleFetch() {
  const url = rssUrl.value.trim()
  if (!url) {
    error.value = '请输入 RSS 订阅地址'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const feed = await fetchAndParseRss(url)

    if (feed.items.length === 0) {
      error.value = '该 RSS feed 中没有找到任何文章'
      feedPreview.value = null
      return
    }

    feedPreview.value = feed

    // 检查是否已导入过该 RSS URL
    const existing = store.findNovelByRssUrl(url)
    if (existing) {
      isNewImport.value = false
      existingNovelId.value = existing.id

      // 计算有多少新章节
      const existingTitles = new Set(existing.chapters.map((c) => c.title))
      const newItems = feed.items.filter((item) => !existingTitles.has(item.title))

      if (newItems.length === 0) {
        error.value = `该 RSS feed 已全部导入到作品「${existing.title}」，没有新内容`
      }
    } else {
      isNewImport.value = true
      existingNovelId.value = null
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '请求失败，请检查 URL 是否正确'
    feedPreview.value = null
  } finally {
    loading.value = false
  }
}

function handleImport() {
  if (!feedPreview.value) return

  const alreadyExisting = existingNovelId.value
    ? store.getNovelById(existingNovelId.value)
    : null

  if (alreadyExisting) {
    // 追加模式：仅添加新章节
    const existingTitles = new Set(alreadyExisting.chapters.map((c) => c.title))
    const newItems = feedPreview.value.items.filter(
      (item) => !existingTitles.has(item.title)
    )

    if (newItems.length === 0) {
      error.value = '没有新章节需要导入'
      return
    }

    const count = store.appendRssChapters(existingNovelId.value!, newItems)
    if (count > 0) {
      router.push(`/editor/${existingNovelId.value}`)
    }
  } else {
    // 新建导入
    const novel = store.importRssFeed(feedPreview.value, rssUrl.value.trim())
    router.push(`/read/${novel.id}`)
  }
}

function getPreviewItems(): RssFeedItem[] {
  if (!feedPreview.value) return []
  return feedPreview.value.items.slice(0, 10)
}

function getRemainingCount(): number {
  if (!feedPreview.value) return 0
  return Math.max(0, feedPreview.value.items.length - 10)
}
</script>

<template>
  <div class="vp-content">
    <button class="vp-back-link" @click="goBack">← 返回书架</button>

    <h1>RSS 导入</h1>
    <p class="vp-subtitle">粘贴 RSS 订阅地址，一键导入文章为新作品</p>

    <!-- 输入阶段 -->
    <section v-if="!hasPreview" class="vp-section">
      <div class="vp-form-group">
        <label>RSS 订阅地址</label>
        <input
          v-model="rssUrl"
          type="url"
          placeholder="https://example.com/feed.xml"
          class="vp-input"
          @keyup.enter="handleFetch"
        />
      </div>

      <div v-if="error" class="vp-error">{{ error }}</div>

      <button
        class="vp-btn vp-btn--primary"
        :disabled="loading || !rssUrl.trim()"
        @click="handleFetch"
      >
        {{ loading ? '正在获取...' : '获取预览' }}
      </button>
    </section>

    <!-- 预览阶段 -->
    <section v-else class="vp-preview-section">
      <div class="vp-preview-header">
        <h2>{{ feedPreview!.title }}</h2>
        <p class="vp-preview-author">作者：{{ feedPreview!.author }}</p>
        <p class="vp-preview-count">共 {{ feedPreview!.items.length }} 篇文章</p>

        <div v-if="existingNovelId" class="vp-info-bar">
          ⚠ 该 RSS feed 之前已导入为作品「{{ store.getNovelById(existingNovelId)?.title }}」
          <br />
          <template v-if="error">（无新章节）</template>
          <template v-else>将追加新章节到已有作品中</template>
        </div>
      </div>

      <div v-if="error && !error.startsWith('该 RSS feed 已全部导入')" class="vp-error">
        {{ error }}
      </div>

      <div class="vp-preview-list">
        <h3>预览（前 10 篇）</h3>
        <div
          v-for="(item, index) in getPreviewItems()"
          :key="index"
          class="vp-preview-item"
        >
          <span class="vp-preview-num">{{ index + 1 }}</span>
          <div class="vp-preview-body">
            <span class="vp-preview-title">{{ item.title }}</span>
            <span class="vp-preview-snippet">{{ item.content.slice(0, 120) }}...</span>
          </div>
        </div>
        <p v-if="getRemainingCount() > 0" class="vp-preview-more">
          ...还有 {{ getRemainingCount() }} 篇
        </p>
      </div>

      <div class="vp-actions">
        <button
          class="vp-btn vp-btn--primary"
          @click="handleImport"
          :disabled="error === ('该 RSS feed 已全部导入到作品「' + (store.getNovelById(existingNovelId!)?.title) + '」，没有新内容')"
        >
          {{ existingNovelId ? '追加新章节' : '确认导入' }}
        </button>
        <button class="vp-btn vp-btn--secondary" @click="goToImport">取消</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.vp-content {
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: 64px;
}

.vp-back-link {
  display: inline-block;
  background: none;
  border: none;
  color: var(--vp-c-brand);
  font-size: 14px;
  padding: 0;
  margin-bottom: 20px;
  font-weight: 500;
  cursor: pointer;
}

.vp-back-link:hover {
  color: var(--vp-c-brand-dark);
  text-decoration: underline;
}

.vp-content > h1 {
  font-size: 2rem;
  margin: 0 0 8px;
}

.vp-subtitle {
  color: var(--vp-c-text-lighter);
  font-size: 14px;
  margin: 0 0 28px;
}

.vp-section {
  margin-bottom: 32px;
  padding: 24px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: var(--vp-radius);
}

.vp-form-group {
  margin-bottom: 16px;
}

.vp-form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-light);
  margin-bottom: 6px;
}

.vp-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--vp-c-border);
  border-radius: var(--vp-radius);
  font-size: 15px;
  font-family: inherit;
  color: var(--vp-c-text);
  background: var(--vp-c-bg);
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.vp-input:focus {
  border-color: var(--vp-c-brand);
  box-shadow: 0 0 0 3px rgba(62, 175, 124, 0.15);
}

.vp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  border: none;
  gap: 6px;
}

.vp-btn:active {
  transform: translateY(0);
}

.vp-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.vp-btn--primary {
  background: var(--vp-c-brand);
  color: #fff;
}

.vp-btn--primary:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
  transform: translateY(-1px);
}

.vp-btn--secondary {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text);
  margin-left: 8px;
}

.vp-btn--secondary:hover {
  background: var(--vp-c-border);
}

.vp-error {
  color: #e74c3c;
  font-size: 13px;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: #fef0ef;
  border-radius: var(--vp-radius);
  border: 1px solid #f5c6cb;
}

/* Preview section */
.vp-preview-section {
  margin-bottom: 32px;
  padding: 24px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: var(--vp-radius);
}

.vp-preview-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vp-c-border);
}

.vp-preview-header h2 {
  font-size: 1.3rem;
  margin: 0 0 8px;
}

.vp-preview-author {
  color: var(--vp-c-text-light);
  font-size: 14px;
  margin: 0 0 4px;
}

.vp-preview-count {
  color: var(--vp-c-text-lighter);
  font-size: 13px;
  margin: 0;
}

.vp-info-bar {
  margin-top: 12px;
  padding: 10px 14px;
  background: #fff8e1;
  border: 1px solid #ffe082;
  border-radius: var(--vp-radius);
  font-size: 13px;
  color: #f57f17;
  line-height: 1.6;
}

.vp-preview-list {
  margin-bottom: 20px;
}

.vp-preview-list h3 {
  font-size: 1rem;
  margin: 0 0 12px;
  color: var(--vp-c-text-light);
}

.vp-preview-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--vp-c-border);
}

.vp-preview-num {
  color: var(--vp-c-text-lighter);
  font-size: 13px;
  min-width: 24px;
  padding-top: 2px;
}

.vp-preview-body {
  flex: 1;
  min-width: 0;
}

.vp-preview-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text);
  margin-bottom: 4px;
}

.vp-preview-snippet {
  display: block;
  font-size: 12px;
  color: var(--vp-c-text-lighter);
  line-height: 1.5;
}

.vp-preview-more {
  text-align: center;
  color: var(--vp-c-text-lighter);
  font-size: 13px;
  margin-top: 12px;
}

.vp-actions {
  display: flex;
  align-items: center;
}
</style>