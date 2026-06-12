import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'eye-care'

const STORAGE_KEY = 'simplenovel_theme'

function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'eye-care') return saved
  } catch {}
  return 'light'
}

function saveTheme(mode: ThemeMode) {
  localStorage.setItem(STORAGE_KEY, mode)
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(loadTheme())

  function setMode(m: ThemeMode) {
    mode.value = m
    saveTheme(m)
  }

  function cycle() {
    const order: ThemeMode[] = ['light', 'dark', 'eye-care']
    const idx = order.indexOf(mode.value)
    const next = (idx + 1) % order.length
    mode.value = order[next]
    saveTheme(mode.value)
  }

  // 同步到 <html> data-theme 属性
  watch(
    mode,
    (val) => {
      document.documentElement.setAttribute('data-theme', val)
    },
    { immediate: true }
  )

  return { mode, setMode, cycle }
})