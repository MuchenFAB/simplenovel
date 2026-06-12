import type { Novel } from '@/types'
import { compressContent, decompressContent } from './compress'

const STORAGE_KEY = 'simplenovel_novels'

/**
 * 保存小说数据到 localStorage (自动压缩内容)
 */
export function saveNovels(novels: Novel[]): void {
  try {
    const json = JSON.stringify(novels)
    localStorage.setItem(STORAGE_KEY, json)
  } catch {
    console.warn('localStorage 写入失败, 可能已满')
  }
}

/**
 * 从 localStorage 读取小说数据 (自动解压内容)
 */
export function loadNovels(): Novel[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}