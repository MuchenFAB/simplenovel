<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNovelStore } from '@/stores/novel'
import { useFontSizeStore, FONT_FAMILIES } from '@/stores/fontSize'
import { siteConfig } from '@/config'
import ChapterSidebar from '@/components/ChapterSidebar.vue'

const route = useRoute()
const router = useRouter()
const store = useNovelStore()
const fontSizeStore = useFontSizeStore()

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
  if (!siteConfig.enableChapterSidebar) return
  sidebarOpen.value = !sidebarOpen.value
}

function onSidebarSelect(chapterId: string) {
  sidebarOpen.value = false
  goToChapter(chapterId)
}

function exportCurrentChapter() {
  if (novel.value && chapter.value) {
    import('@/utils/exportPdf').then((m) =>
      m.exportChapterPdf(chapter.value!, novel.value!.title)
    )
  }
}

function onFontFamilyChange(e: Event) {
  const target = e.target as HTMLSelectElement
  fontSizeStore.setFamily(target.value)
}

// ====================
// Anti-crawl protection (controlled by enableAntiCrawl config)
// ====================

function preventContextMenu(e: Event) {
  if (siteConfig.allowContextMenu) return true
  e.preventDefault()
  return false
}

function preventShortcuts(e: KeyboardEvent) {
  if (siteConfig.allowCopy) return

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
  if (!siteConfig.enableAntiCrawl) return
  e.preventDefault()
  return false
}

let observer: MutationObserver | null = null

onMounted(() => {
  if (!siteConfig.enableAntiCrawl) return

  const doc = docRef.value
  if (doc) {
    doc.addEventListener('contextmenu', preventContextMenu)
    if (!siteConfig.allowCopy) {
      doc.addEventListener('selectstart', (e) => e.preventDefault())
    }
    doc.addEventListener('dragstart', preventDragStart)
  }
  document.addEventListener('keydown', preventShortcuts)

  observer = new MutationObserver(() => {
    if (docRef.value && !siteConfig.allowCopy) {
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
    <ChapterSidebar
      v-if="siteConfig.enableChapterSidebar"
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
        <button
          v-if="siteConfig.enableChapterSidebar"
          class="vp-sidebar-toggle"
          @click="toggleSidebar"
          title="目录"
        >
          <span class="vp-hamburger">
            <i></i><i></i><i></i>
          </span>
        </button>
        <button class="vp-link" @click="goHome">首页</button>
        <span class="separator">/</span>
        <button class="vp-link" @click="goToNovel">{{ novel.title }}</button>
        <span class="separator">/</span>
        <span class="current">{{ chapter.title }}</span>
      </nav>

      <div class="vp-toolbar">
        <button class="vp-export-btn" @click="exportCurrentChapter">导出本章PDF</button>
        <div class="vp-font-controls">
          <select
            class="vp-font-family-select"
            :value="fontSizeStore.family"
            @change="onFontFamilyChange"
          >
            <option
              v-for="f in FONT_FAMILIES"
              :key="f.value"
              :value="f.value"
            >{{ f.label }}</option>
          </select>
          <button class="vp-font-btn" @click="fontSizeStore.decrease()" title="缩小" :disabled="fontSizeStore.size <= fontSizeStore.MIN_SIZE">A-</button>
          <span class="vp-font-size">{{ fontSizeStore.size }}</span>
          <button class="vp-font-btn" @click="fontSizeStore.increase()" title="放大" :disabled="fontSizeStore.size >= fontSizeStore.MAX_SIZE">A+</button>
        </div>
      </div>

      <!-- 章节正文 -->
      <article
        class="vp-doc"
        ref="docRef"
        :class="{ 'no-protection': !siteConfig.enableAntiCrawl || siteConfig.allowCopy }"
      >
        <h1>{{ chapter.title }}</h1>
        <div class="vp-doc-content" :class="{ protected: siteConfig.enableAntiCrawl && !siteConfig.allowCopy }">
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

/* 面包屑 */
.vp-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--vp-c-text-lighter);
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.vp-sidebar-toggle {
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-border);
  padding: 6px 8px;
  border-radius: var(--vp-radius-sm);
  cursor: pointer;
  color: var(--vp-c-text-light);
  line-height: 1;
  margin-right: 4px;
  transition: background 0.15s, border-color 0.15s;
}

/* 三条横线图标 */
.vp-hamburger {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 16px;
}

.vp-hamburger i {
  display: block;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
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
  flex: 1;
  min-width: 0;
}

.vp-doc h1 {
  font-size: 2rem;
  margin: 0 0 28px;
  text-align: center;
}

.vp-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--vp-c-border);
}

.vp-export-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-border);
  padding: 5px 12px;
  border-radius: var(--vp-radius);
  font-size: 13px;
  cursor: pointer;
  color: var(--vp-c-text-light);
  transition: all 0.25s ease;
}

.vp-export-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
  background: var(--vp-c-bg);
}

.vp-font-controls {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.vp-font-family-select {
  padding: 5px 8px;
  border: 1px solid var(--vp-c-border);
  border-radius: var(--vp-radius);
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-light);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition: all 0.25s ease;
}

.vp-font-family-select:focus {
  border-color: var(--vp-c-brand);
}

.vp-font-btn {
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-border);
  padding: 5px 8px;
  border-radius: var(--vp-radius);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: var(--vp-c-text-light);
  transition: all 0.25s ease;
}

.vp-font-btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.vp-font-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.vp-font-size {
  font-size: 13px;
  color: var(--vp-c-text);
  min-width: 24px;
  text-align: center;
  font-weight: 600;
}

.vp-doc-content {
  font-size: v-bind('fontSizeStore.size + "px"');
  font-family: v-bind('fontSizeStore.family');
  line-height: 2;
  color: var(--vp-c-text);
}

.vp-doc-content.protected {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  -webkit-user-drag: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

.vp-doc-content p {
  margin: 0 0 12px;
}

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