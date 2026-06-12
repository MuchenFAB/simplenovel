const NOVEL_COUNTER_KEY = 'simplenovel_novel_counter'
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

/** 获取并递增小说字母计数器 (返回 A, B, ..., AA, AB, ...) */
export function nextNovelId(): string {
  const raw = localStorage.getItem(NOVEL_COUNTER_KEY)
  const next = raw ? parseInt(raw, 10) + 1 : 0
  localStorage.setItem(NOVEL_COUNTER_KEY, next.toString())
  return toAlphabet(next)
}

/** 获取并递增章节数字计数器 (返回 0001, 0002, ...) */
export function nextChapterId(): string {
  const raw = localStorage.getItem(CHAPTER_COUNTER_KEY)
  const next = raw ? parseInt(raw, 10) + 1 : 1
  localStorage.setItem(CHAPTER_COUNTER_KEY, next.toString())
  return String(next).padStart(4, '0')
}

/**
 * 初始化计数器并清除旧的迁移标记.
 * 仅在新的 ID 方案投入使用前调用，避免计数器从零开始覆盖旧数据.
 */
export function initCountersFromData(novelCount: number, chapterCounts: number[]): void {
  if (localStorage.getItem(NOVEL_COUNTER_KEY) !== null) return

  // 根据现有数据初始化计数器
  localStorage.setItem(NOVEL_COUNTER_KEY, (novelCount - 1).toString())
  const totalChapters = chapterCounts.reduce((a, b) => a + b, 0)
  localStorage.setItem(CHAPTER_COUNTER_KEY, totalChapters.toString())
}