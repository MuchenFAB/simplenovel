<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNovelStore } from '@/stores/novel'

const route = useRoute()
const router = useRouter()
const store = useNovelStore()

const novelId = computed(() => route.params.novelId as string)
const chapterId = computed(() => route.params.chapterId as string)
const novel = computed(() => store.getNovelById(novelId.value))
const chapter = computed(() => store.getChapterById(novelId.value, chapterId.value))

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
</script>

<template>
  <div v-if="novel && chapter" class="chapter-view">
    <nav class="chapter-nav-top">
      <button class="btn-link" @click="goHome">首页</button>
      <span>/</span>
      <button class="btn-link" @click="goToNovel">{{ novel.title }}</button>
      <span>/</span>
      <span>{{ chapter.title }}</span>
    </nav>

    <article class="chapter-content">
      <h1>{{ chapter.title }}</h1>
      <div class="content-text">
        <p v-for="(paragraph, i) in chapter.content.split('\n').filter(Boolean)" :key="i">
          {{ paragraph }}
        </p>
      </div>
    </article>

    <div class="chapter-nav-bottom">
      <button
        v-if="prevChapter"
        class="btn-nav"
        @click="goToChapter(prevChapter.id)"
      >
        ← {{ prevChapter.title }}
      </button>
      <span v-else></span>

      <button
        v-if="nextChapter"
        class="btn-nav"
        @click="goToChapter(nextChapter.id)"
      >
        {{ nextChapter.title }} →
      </button>
      <span v-else></span>
    </div>
  </div>

  <div v-else class="not-found">
    <p>章节不存在或已被删除</p>
    <button class="btn-link" @click="goHome">← 返回首页</button>
  </div>
</template>

<style scoped>
.chapter-view {
  max-width: 720px;
  margin: 0 auto;
}

.chapter-nav-top {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #999;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.btn-link {
  background: none;
  border: none;
  color: #4a90d9;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}

.btn-link:hover {
  text-decoration: underline;
}

.chapter-content h1 {
  font-size: 26px;
  margin: 0 0 24px;
  text-align: center;
}

.content-text {
  font-size: 16px;
  line-height: 2;
  color: #333;
}

.content-text p {
  text-indent: 2em;
  margin: 0 0 8px;
}

.chapter-nav-bottom {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-nav {
  background: #f5f7fa;
  border: 1px solid #e0e0e0;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-nav:hover {
  background: #e8ecf1;
}

.not-found {
  text-align: center;
  padding: 80px 0;
  color: #999;
}
</style>