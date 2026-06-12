import { defineStore } from 'pinia'
import { ref, computed, inject } from 'vue'
import { nextNovelId, nextChapterId } from '@/utils/shortid'
import { maybeMigrateIds } from '@/utils/migrateIds'
import { initCountersFromData } from '@/utils/counter'
import { siteConfig } from '@/config'
import { fetchAndParseRss } from '@/utils/rssParser'
import type { NovelApi } from '@/api/novelApi'
import type { Novel, Chapter } from '@/types'
import type { RssFeedInfo } from '@/utils/rssParser'

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

    // 启动后尝试执行每日 RSS 自动同步
    syncAllRssFeeds()
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

  function findNovelByRssUrl(url: string): Novel | undefined {
    return novels.value.find((n) => n.rssUrl === url)
  }

  function importRssFeed(feed: RssFeedInfo, rssUrl: string): Novel {
    const now = Date.now()
    const novel: Novel = {
      id: nextNovelId(novels.value.map((n) => n.id)),
      title: feed.title,
      author: feed.author,
      chapters: feed.items.map((item) => ({
        id: nextChapterId(),
        title: item.title,
        content: item.content,
        createdAt: now,
        updatedAt: now,
      })),
      createdAt: now,
      updatedAt: now,
      rssUrl,
      lastRssSyncAt: now,
    }
    novels.value.unshift(novel)
    persist()
    return novel
  }

  function appendRssChapters(novelId: string, newItems: RssFeedInfo['items']): number {
    const novel = getNovelById(novelId)
    if (!novel) return 0

    const existingTitles = new Set(novel.chapters.map((c) => c.title))
    let addedCount = 0

    for (const item of newItems) {
      if (!existingTitles.has(item.title)) {
        novel.chapters.push({
          id: nextChapterId(),
          title: item.title,
          content: item.content,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        addedCount++
      }
    }

    if (addedCount > 0) {
      novel.updatedAt = Date.now()
      persist()
    }

    return addedCount
  }

  /**
   * 每日 RSS 自动同步：遍历所有有 rssUrl 的作品，
   * 检查上次同步时间是否超过 24 小时，如需要则拉取新章节
   */
  async function syncAllRssFeeds(): Promise<void> {
    if (!siteConfig.enableRssAutoSync) return

    const now = Date.now()
    const ONE_DAY = 24 * 60 * 60 * 1000

    for (const novel of novels.value) {
      if (!novel.rssUrl) continue

      // 距离上次同步不足 24 小时则跳过
      if (novel.lastRssSyncAt && now - novel.lastRssSyncAt < ONE_DAY) {
        continue
      }

      try {
        const feed = await fetchAndParseRss(novel.rssUrl)

        const existingTitles = new Set(novel.chapters.map((c) => c.title))
        let addedCount = 0

        for (const item of feed.items) {
          if (!existingTitles.has(item.title)) {
            novel.chapters.push({
              id: nextChapterId(),
              title: item.title,
              content: item.content,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
            addedCount++
          }
        }

        if (addedCount > 0) {
          novel.updatedAt = Date.now()
        }

        novel.lastRssSyncAt = now
      } catch {
        // 同步失败静默跳过，不影响其他 feed
      }
    }

    // 所有 feed 同步完成后统一持久化
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
    findNovelByRssUrl,
    importRssFeed,
    appendRssChapters,
    syncAllRssFeeds,
  }
})