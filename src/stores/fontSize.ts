import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const SIZE_KEY = 'simplenovel_font_size'
const FAMILY_KEY = 'simplenovel_font_family'

const DEFAULT_SIZE = 16
const MIN_SIZE = 12
const MAX_SIZE = 24

export const FONT_FAMILIES = [
  { label: '系统默认', value: 'system-ui, -apple-system, "Segoe UI", sans-serif' },
  { label: '宋体 (Song)', value: '"SimSun", "Songti SC", serif' },
  { label: '黑体 (Hei)', value: '"SimHei", "Heiti SC", sans-serif' },
  { label: '楷体 (Kai)', value: '"KaiTi", "Kaiti SC", serif' },
  { label: '仿宋 (FangSong)', value: '"FangSong", "Fangsong SC", serif' },
  { label: '等宽 (Mono)', value: '"Courier New", "Fira Code", monospace' },
]

function loadSize(): number {
  try {
    const saved = localStorage.getItem(SIZE_KEY)
    const val = saved ? parseInt(saved, 10) : DEFAULT_SIZE
    return Math.max(MIN_SIZE, Math.min(MAX_SIZE, val))
  } catch {
    return DEFAULT_SIZE
  }
}

function loadFamily(): string {
  try {
    const saved = localStorage.getItem(FAMILY_KEY)
    if (saved && FONT_FAMILIES.some((f) => f.value === saved)) {
      return saved
    }
  } catch {}
  return FONT_FAMILIES[0].value
}

export const useFontSizeStore = defineStore('fontSize', () => {
  const size = ref(loadSize())
  const family = ref(loadFamily())

  function increase() {
    if (size.value < MAX_SIZE) size.value += 2
  }

  function decrease() {
    if (size.value > MIN_SIZE) size.value -= 2
  }

  function resetSize() {
    size.value = DEFAULT_SIZE
  }

  function setFamily(f: string) {
    family.value = f
  }

  watch(size, (val) => {
    localStorage.setItem(SIZE_KEY, val.toString())
  })

  watch(family, (val) => {
    localStorage.setItem(FAMILY_KEY, val)
  })

  return { size, family, increase, decrease, resetSize, setFamily, FONT_FAMILIES, MIN_SIZE, MAX_SIZE }
})