import type { Novel, Chapter } from '@/types'

/* ======== MongoDB 接口抽象层 ======== */

export interface NovelApi {
  getAllNovels(): Promise<Novel[]>
  saveNovels(novels: Novel[]): Promise<void>
}

/* ======== localStorage 实现 ======== */

const STORAGE_KEY = 'simplenovel_novels'

export function createLocalApi(): NovelApi {
  return {
    async getAllNovels() {
      try {
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? JSON.parse(data) : []
      } catch {
        return []
      }
    },
    async saveNovels(novels: Novel[]) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(novels))
      } catch {
        console.warn('localStorage 写入失败, 可能已满')
      }
    },
  }
}

/* ======== MongoDB 实现 (REST API) ======== */

export function createMongoApi(baseUrl: string, dbName: string): NovelApi {
  const endpoint = (path: string) =>
    `${baseUrl.replace(/\/$/, '')}/api/${dbName}${path}`

  return {
    async getAllNovels(): Promise<Novel[]> {
      try {
        const res = await fetch(endpoint('/novels'))
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return await res.json()
      } catch (e) {
        console.warn('MongoDB 读取失败, 返回空列表', e)
        return []
      }
    },
    async saveNovels(novels: Novel[]): Promise<void> {
      try {
        const res = await fetch(endpoint('/novels'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novels),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      } catch (e) {
        console.warn('MongoDB 写入失败', e)
      }
    },
  }
}