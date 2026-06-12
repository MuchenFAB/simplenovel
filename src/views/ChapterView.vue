<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNovelStore } from '@/stores/novel'
import ChapterSidebar from '@/components/ChapterSidebar.vue'

const route = useRoute()
const router = useRouter()
const store = useNovelStore()

const novelId = computed(() => route.params.novelId as string)
const chapterId = computed(() => route.params.chapterId as string)
const novel = computed(() => store.getNovelById(novelId.value))
const chapter = computed(() => store.getChapterById(novelId.value, chapterId.value))
const docRef = ref<HTMLElement | null>(null)
const sidebarOpen = ref(false)

const chapterIndex = computed(() => {
  if (!novel.value) return -1
  return novel.value.chapters.findIndex((c) => c.id === chapterId.value)
})

const prevChapter = computed(() => {
  if (!novel.value || chapterIndex.value <= 0) return null
  return novel.value.chapters[chapterIndex.value - 1]
})

const nextChapter = computed(() => {
  if (!novel.value || chapterIndex.value >= novel.value.chapters.length - 1) return null
  return novel.value.chapters[chapterIndex.value + 1]
})

function goToChapter(chId: string) {
  router.push(`/read/${novelId.value}/${chId}`)
}

function goToNovel() {
  router.push(`/read/${novelId.value}`)
}

function goHome() {
  router.push('/')
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function onSidebarSelect(chapterId: string) {
  sidebarOpen.value = false
  goToChapter(chapterId)
}

// ====================
// 防爬保护层
// ====================

function preventContextMenu(e: Event) {
  e.preventDefault()
  return false
}

function preventShortcuts(e: KeyboardEvent) {
  if (
    e.ctrlKey &&
    (e.key === 'c' || e.key === 'C' ||
     e.key === 's' || e.key === 'S' ||
     e.key === 'u' || e.key === 'U' ||
     e.key === 'p' || e.key === 'P')
  ) {
    e.preventDefault()
    return false
  }
  if (e.key === 'F12') {
    e.preventDefault()
    return false
  }
  if (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J')) {
    e.preventDefault()
    return false
  }
}

function preventDragStart(e: DragEvent) {
  e.preventDefault()
  return false
}

let observer: MutationObserver | null = null

onMounted(() => {
  const doc = docRef.value
  if (doc) {
    doc.addEventListener('contextmenu', preventContextMenu)
    doc.addEventListener('dragstart', preventDragStart)
    doc.addEventListener('selectstart', (e) => e.preventDefault())
  }
  document.addEventListener('keydown', preventShortcuts)

  observer = new MutationObserver(() => {
    if (docRef.value) {
      docRef.value.style.userSelect = 'none'
      docRef.value.style.webkitUserSelect = 'none'
    }
  })
  if (docRef.value) {
    observer.observe(docRef.value, { attributes: true, attributeFilter: ['style'] })
  }
})

onUnmounted(() => {
  const doc = docRef.value
  if (doc) {
    doc.removeEventListener('contextmenu', preventContextMenu)
    doc.removeEventListener('dragstart', preventDragStart)
    doc.removeEventListener('selectstart', (e) => e.preventDefault())
  }
  document.removeEventListener('keydown', preventShortcuts)
  if (observer) observer.disconnect()
})
</script>

<template>
  <div v-if="novel && chapter" class="chapter-wrapper">
    <!-- 章节侧栏 -->
    <ChapterSidebar
      :chapters="novel.chapters"
      :novel-id="novelId"
      :current-chapter-id="chapterId"
      :open="sidebarOpen"
      @close="sidebarOpen = false"
      @select="onSidebarSelect"
    />

    <div class="vp-content">
      <!-- 面包屑导航 -->
      <nav class="vp-breadcrumb">
        <button class="vp-sidebar-toggle" @click="toggleSidebar" title="目录">
          📑
        </button>
        <button class="vp-link" @click="goHome">首页</button>
        <span class="separator">/</span>
        <button class="vp-link" @click="goToNovel">{{ novel.title }}</button>
        <span class="separator">/</span>
        <span class="current">{{ chapter.title }}</span>
      </nav>

      <!-- 章节正文（受保护） -->
      <article class="vp-doc" ref="docRef">
        <h1>{{ chapter.title }}</h1>
        <div class="vp-doc-content protected-text">
          <p v-for="(paragraph, i) in chapter.content.split('\n').filter(Boolean)" :key="i">
            {{ paragraph }}
          </p>
        </div>
      </article>

      <!-- 上下章导航 -->
      <div class="vp-prev-next">
        <button
          v-if="prevChapter"
          class="vp-nav-btn"
          @click="goToChapter(prevChapter.id)"
        >
          ← {{ prevChapter.title }}
        </button>
        <span v-else></span>

        <button
          v-if="nextChapter"
          class="vp-nav-btn"
          @click="goToChapter(nextChapter.id)"
        >
          {{ nextChapter.title }} →
        </button>
        <span v-else></span>
      </div>
    </div>
  </div>

  <div v-else class="vp-empty">
    <p>章节不存在或已被删除</p>
    <button class="vp-back-link" @click="goHome">← 返回首页</button>
  </div>
</template>

<style scoped>
.vp-content {
  max-width: 720px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .vp-content {
    margin-left: 280px;
    max-width: 680px;
  }
}

/* 侧栏遮罩（移动端） */
@media (max-width: 1023px) {
  .chapter-wrapper::after {
    content: '';
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 89;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s;
  }
}

/* 面包屑 */
.vp-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--vp-c-text-lighter);
  margin-bottom: 28px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--vp-c-border);
}

.vp-sidebar-toggle {
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-border);
  font-size: 14px;
  padding: 4px 8px;
  border-radius: var(--vp-radius-sm);
  cursor: pointer;
  color: var(--vp-c-text-light);
  line-height: 1;
  margin-right: 4px;
  transition: background 0.15s, border-color 0.15s;
}

.vp-sidebar-toggle:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

@media (min-width: 1024px) {
  .vp-sidebar-toggle {
    display: none;
  }
}

.vp-link {
  background: none;
  border: none;
  color: var(--vp-c-brand);
  cursor: pointer;
  font-size: 13px;
  padding: 0;
  font-weight: 500;
}

.vp-link:hover {
  color: var(--vp-c-brand-dark);
  text-decoration: underline;
}

.separator {
  color: var(--vp-c-border);
}

.current {
  color: var(--vp-c-text-light);
}

/* 文档正文 */
.vp-doc h1 {
  font-size: 2rem;
  margin: 0 0 28px;
  text-align: center;
}

/* ====== 防爬保护 ====== */
.vp-doc-content {
  font-size: 16px;
  line-height: 2;
  color: var(--vp-c-text);

  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  -webkit-user-drag: none;
  user-drag: none;

  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

.vp-doc-content p {
  text-indent: 2em;
  margin: 0 0 12px;
}

/* 上下章导航 */
.vp-prev-next {
  display: flex;
  justify-content: space-between;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-border);
}

.vp-nav-btn {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  padding: 12px 24px;
  border-radius: var(--vp-radius);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-light);
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.2s;
}

.vp-nav-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
  box-shadow: var(--vp-c-shadow-sm);
}

.vp-back-link {
  display: inline-block;
  background: none;
  border: none;
  color: var(--vp-c-brand);
  font-size: 14px;
  padding: 0;
  font-weight: 500;
}

.vp-back-link:hover {
  color: var(--vp-c-brand-dark);
  text-decoration: underline;
}

.vp-empty {
  text-align: center;
  padding: 80px 0;
  color: var(--vp-c-text-lighter);
}
</style>