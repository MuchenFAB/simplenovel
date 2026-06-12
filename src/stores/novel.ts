import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from '@/utils/uuid'
import { saveNovels, loadNovels } from '@/utils/storage'
import type { Novel, Chapter } from '@/types'

export const useNovelStore = defineStore('novel', () => {
  // --- 状态 ---
  const novels = ref<Novel[]>(loadNovels())

  // --- 计算属性 ---
  const novelCount = computed(() => novels.value.length)

  function getNovelById(id: string): Novel | undefined {
    return novels.value.find((n) => n.id === id)
  }

  function getChapterById(novelId: string, chapterId: string): Chapter | undefined {
    const novel = getNovelById(novelId)
    return novel?.chapters.find((c) => c.id === chapterId)
  }

  // --- 操作 ---
  function createNovel(title: string, author = '未知作者'): Novel {
    const novel: Novel = {
      id: uuidv4(),
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
      id: uuidv4(),
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
    updates: Partial<Pick<Chapter, 'title' | 'content'>>
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

  // --- 持久化 ---
  function persist(): void {
    saveNovels(novels.value)
  }

  return {
    novels,
    novelCount,
    getNovelById,
    getChapterById,
    createNovel,
    updateNovel,
    deleteNovel,
    addChapter,
    updateChapter,
    deleteChapter,
  }
})