const CHAPTER_COUNTER_KEY = 'simplenovel_chapter_counter'

/** 将数字转换为字母序号: 0->A, 1->B, ..., 25->Z, 26->AA, 27->AB, ... */
function toAlphabet(index: number): string {
  let n = index
  let result = ''
  while (n >= 0) {
    result = String.fromCharCode(65 + (n % 26)) + result
    n = Math.floor(n / 26) - 1
  }
  return result
}

/**
 * 从已有的小说 ID 列表中找出最小的未使用字母 ID.
 * 自动填补删除后留下的空位.
 */
export function nextNovelId(usedIds: string[]): string {
  const used = new Set(usedIds)
  let index = 0
  while (true) {
    const id = toAlphabet(index)
    if (!used.has(id)) return id
    index++
  }
}

/** 获取并递增章节数字计数器 (返回 0001, 0002, ...) */
export function nextChapterId(): string {
  const raw = localStorage.getItem(CHAPTER_COUNTER_KEY)
  const next = raw ? parseInt(raw, 10) + 1 : 1
  localStorage.setItem(CHAPTER_COUNTER_KEY, next.toString())
  return String(next).padStart(4, '0')
}

/**
 * 初始化章节计数器.
 * 仅在新的 ID 方案投入使用前调用, 避免计数器从零开始覆盖旧数据.
 */
export function initCountersFromData(chapterCounts: number[]): void {
  const totalChapters = chapterCounts.reduce((a, b) => a + b, 0)
  localStorage.setItem(CHAPTER_COUNTER_KEY, totalChapters.toString())
}