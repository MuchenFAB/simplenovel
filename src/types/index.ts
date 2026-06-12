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
}