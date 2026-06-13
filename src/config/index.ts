import { reactive, readonly } from 'vue'

/**
 * Site configuration
 * Modify this object to globally toggle various features
 */
export interface SiteConfig {
  /** Site name */
  siteName: string
  /** Site description */
  siteDescription: string

  /** Enable dark mode */
  enableDarkMode: boolean
  /** Enable eye-care mode */
  enableEyeCareMode: boolean
  /** Default theme ('light' | 'dark' | 'eye-care') */
  defaultTheme: 'light' | 'dark' | 'eye-care'

  /** Show chapter sidebar on reader page */
  enableChapterSidebar: boolean
  /** Show global footer bar */
  enableFootbar: boolean
  /** Footer bar content file (relative to project root) */
  footbarFile: string

  /** Enable anti-crawl protection on reader page */
  enableAntiCrawl: boolean
  /** Allow Ctrl+C copy */
  allowCopy: boolean
  /** Allow context menu (right-click) */
  allowContextMenu: boolean

  /** Enable MongoDB storage backend */
  useMongoDB: boolean
  /** MongoDB REST API base URL (e.g. http://localhost:3001) */
  mongoBaseUrl: string
  /** MongoDB database name */
  mongoDbName: string

  /** Enable daily auto-sync for RSS-imported novels */
  enableRssAutoSync: boolean

  /** ICP license number */
  icpNumber: string
}

const defaultConfig: SiteConfig = {
  siteName: 'SimpleNovel',
  siteDescription: '',

  enableDarkMode: true,
  enableEyeCareMode: true,
  defaultTheme: 'light',

  enableChapterSidebar: true,
  enableFootbar: true,
  footbarFile: 'footbar.md',

  enableAntiCrawl: true,
  allowCopy: false,
  allowContextMenu: false,

  useMongoDB: true,
  mongoBaseUrl: '',
  mongoDbName: 'simplenovel',

  enableRssAutoSync: true,

  icpNumber: '',
}

const state = reactive<SiteConfig>({ ...defaultConfig })

/** Readonly site configuration */
export const siteConfig = readonly(state) as Readonly<SiteConfig>

/**
 * Reset config to defaults
 */
export function resetConfig(): void {
  Object.assign(state, defaultConfig)
}

/**
 * Update partial config
 */
export function updateConfig(partial: Partial<SiteConfig>): void {
  Object.assign(state, partial)
}