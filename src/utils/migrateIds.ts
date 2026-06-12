import type { Novel } from '@/types'
import { nextNovelId, nextChapterId } from './counter'

/**
 * 将 localStorage 中旧 UUID 格式的小说/章节 ID 迁移为按顺序的新 ID.
 * 返回是否发生了迁移.
 */
const MIGRATED_KEY = 'simplenovel_id_migrated'

export function maybeMigrateIds(novels: Novel[]): boolean {
  if (localStorage.getItem(MIGRATED_KEY) === '1') return false

  const replaced = new Map<string, string>()
  const usedIds = novels.filter((n) => n.id.length <= 10).map((n) => n.id)

  for (const novel of novels) {
    if (novel.id.length > 10) {
      const newId = replaced.get(novel.id) ?? nextNovelId(usedIds)
      replaced.set(novel.id, newId)
      novel.id = newId
      usedIds.push(newId)
    }
    for (const ch of novel.chapters) {
      if (ch.id.length > 10) {
        const newId = replaced.get(ch.id) ?? nextChapterId()
        replaced.set(ch.id, newId)
        ch.id = newId
      }
    }
  }

  localStorage.setItem(MIGRATED_KEY, '1')
  return true
}