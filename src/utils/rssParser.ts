export interface RssFeedInfo {
  title: string
  author: string
  items: RssFeedItem[]
}

export interface RssFeedItem {
  title: string
  content: string
}

/**
 * 解析 RSS 2.0 XML 文本
 * 提取 channel/title, channel/author (或 dc:creator), 以及每个 item 的 title 和 description
 */
export function parseRssXml(xmlText: string): RssFeedInfo {
  // 使用 DOMParser 解析 XML
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')

  // 检查解析错误
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error('RSS XML 解析失败: ' + parseError.textContent)
  }

  const channel = doc.querySelector('channel')
  if (!channel) {
    throw new Error('无效的 RSS 格式: 缺少 <channel> 元素')
  }

  // 提取 feed 级别信息
  const title =
    channel.querySelector('title')?.textContent?.trim() || '未知作品'
  const author =
    channel.querySelector('dc\\:creator, creator')?.textContent?.trim() ||
    channel.querySelector('author')?.textContent?.trim() ||
    '未知作者'

  // 提取每个 item
  const itemElements = channel.querySelectorAll('item')
  const items: RssFeedItem[] = []

  itemElements.forEach((itemEl) => {
    const itemTitle =
      itemEl.querySelector('title')?.textContent?.trim() || '无标题'
    const rawContent =
      itemEl.querySelector('description')?.textContent?.trim() ||
      itemEl.querySelector('content\\:encoded, encoded')?.textContent?.trim() ||
      ''

    // 去除 HTML 标签，保留纯文本
    const content = stripHtml(rawContent)

    items.push({ title: itemTitle, content })
  })

  return { title, author, items }
}

/**
 * 简单去除 HTML 标签
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/&/g, '&')
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * CORS 代理列表，按优先级排列
 * 遇到 403 或其他错误时自动切换备用代理
 */
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?url=',
  'https://rss-proxy.muchen-libs.workers.dev/?url=',
]

/**
 * 通过 URL 获取并解析 RSS feed
 * 依次尝试多个 CORS 代理，任意一个成功即返回
 */
export async function fetchAndParseRss(url: string): Promise<RssFeedInfo> {
  const encoded = encodeURIComponent(url)
  let lastError: Error | null = null

  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = proxy + encoded
      const response = await fetch(proxyUrl)

      if (response.ok) {
        const text = await response.text()
        return parseRssXml(text)
      }

      // 记录非 2xx 状态用于调试
      lastError = new Error(`代理 ${proxy} 返回 HTTP ${response.status}`)
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
    }
    // 当前代理失败，继续尝试下一个
  }

  throw new Error(
    `所有 CORS 代理均请求失败。最后错误: ${lastError?.message || '未知错误'}。` +
    `可尝试在 src/utils/rssParser.ts 中添加新的代理地址。`
  )
}
