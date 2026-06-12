import { defineStore } from 'pinia'
import { ref, computed, inject } from 'vue'
import { nextNovelId, nextChapterId } from '@/utils/shortid'
import { maybeMigrateIds } from '@/utils/migrateIds'
import { initCountersFromData } from '@/utils/counter'
import type { NovelApi } from '@/api/novelApi'
import type { Novel, Chapter } from '@/types'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const useNovelStore = defineStore('novel', () => {
  const api = inject<NovelApi>('novelApi')!
  const novels = ref<Novel[]>([])
  const loading = ref(true)

  // 启动时从 API 加载
  ;(async () => {
    novels.value = await api.getAllNovels()
    if (novels.value.length > 0) {
      const hadOld = maybeMigrateIds(novels.value)
      if (hadOld) {
        await api.saveNovels(novels.value)
        await delay(100) // 等待存储完成
      }
      initCountersFromData(
        novels.value.map((n) => n.chapters.length),
      )
    }
    loading.value = false
  })()

  const novelCount = computed(() => novels.value.length)

  function getNovelById(id: string): Novel | undefined {
    return novels.value.find((n) => n.id === id)
  }

  function getChapterById(novelId: string, chapterId: string): Chapter | undefined {
    const novel = getNovelById(novelId)
    return novel?.chapters.find((c) => c.id === chapterId)
  }

  function checkTitleDuplicate(title: string, excludeId?: string): boolean {
    const t = title.trim()
    return novels.value.some((n) => n.title === t && n.id !== excludeId)
  }

  function createNovel(title: string, author = '未知作者'): Novel {
    const novel: Novel = {
      id: nextNovelId(novels.value.map((n) => n.id)),
      title,
      author,
      chapters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    novels.value.unshift(novel)
    persist()
    return novel
  }

  function updateNovel(id: string, updates: Partial<Pick<Novel, 'title' | 'author'>>): void {
    const novel = getNovelById(id)
    if (!novel) return
    Object.assign(novel, updates, { updatedAt: Date.now() })
    persist()
  }

  function deleteNovel(id: string): void {
    novels.value = novels.value.filter((n) => n.id !== id)
    persist()
  }

  function addChapter(novelId: string, title: string, content: string): Chapter | null {
    const novel = getNovelById(novelId)
    if (!novel) return null
    const chapter: Chapter = {
      id: nextChapterId(),
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    novel.chapters.push(chapter)
    novel.updatedAt = Date.now()
    persist()
    return chapter
  }

  function updateChapter(
    novelId: string,
    chapterId: string,
    updates: Partial<Pick<Chapter, 'title' | 'content'>>,
  ): void {
    const chapter = getChapterById(novelId, chapterId)
    if (!chapter) return
    Object.assign(chapter, updates, { updatedAt: Date.now() })
    const novel = getNovelById(novelId)!
    novel.updatedAt = Date.now()
    persist()
  }

  function deleteChapter(novelId: string, chapterId: string): void {
    const novel = getNovelById(novelId)
    if (!novel) return
    novel.chapters = novel.chapters.filter((c) => c.id !== chapterId)
    novel.updatedAt = Date.now()
    persist()
  }

  function persist(): void {
    api.saveNovels(novels.value)
  }

  return {
    novels,
    loading,
    novelCount,
    getNovelById,
    getChapterById,
    createNovel,
    checkTitleDuplicate,
    updateNovel,
    deleteNovel,
    addChapter,
    updateChapter,
    deleteChapter,
  }
})