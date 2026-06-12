import type { Novel } from '@/types'

const STORAGE_KEY = 'simplenovel_novels'

/**
 * 保存小说数据到 localStorage
 */
export function saveNovels(novels: Novel[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novels))
  } catch {
    console.warn('localStorage 写入失败，可能已满')
  }
}

/**
 * 从 localStorage 读取小说数据
 */
export function loadNovels(): Novel[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}