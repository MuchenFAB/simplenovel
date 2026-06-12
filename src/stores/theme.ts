import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { siteConfig } from '@/config'

export type ThemeMode = 'light' | 'dark' | 'eye-care'

const STORAGE_KEY = 'simplenovel_theme'

function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'eye-care') return saved
  } catch {}
  return siteConfig.defaultTheme
}

function saveTheme(mode: ThemeMode) {
  localStorage.setItem(STORAGE_KEY, mode)
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(loadTheme())

  function setMode(m: ThemeMode) {
    // Check config allows this mode
    if (m === 'dark' && !siteConfig.enableDarkMode) return
    if (m === 'eye-care' && !siteConfig.enableEyeCareMode) return
    mode.value = m
    saveTheme(m)
  }

  function cycle() {
    // Build available mode list from config
    const allModes: ThemeMode[] = ['light']
    if (siteConfig.enableDarkMode) allModes.push('dark')
    if (siteConfig.enableEyeCareMode) allModes.push('eye-care')

    const idx = allModes.indexOf(mode.value)
    const next = (idx + 1) % allModes.length
    mode.value = allModes[next]
    saveTheme(mode.value)
  }

  // Sync to <html> data-theme attribute
  watch(
    mode,
    (val) => {
      document.documentElement.setAttribute('data-theme', val)
    },
    { immediate: true }
  )

  return { mode, setMode, cycle }
})