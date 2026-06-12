/** 章节 */
export interface Chapter {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

/** 小说作品 */
export interface Novel {
  id: string
  title: string
  author: string
  chapters: Chapter[]
  createdAt: number
  updatedAt: number
  /** 来源 RSS feed URL（通过 RSS 导入时记录，用于后续追加更新） */
  rssUrl?: string
  /** 上次 RSS 同步时间戳（用于每日自动同步） */
  lastRssSyncAt?: number
}
