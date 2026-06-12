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
 * CORS 代理前缀，用于绕过跨域限制获取 RSS feed
 * 使用 corsproxy.io 公共代理服务
 */
const CORS_PROXY = 'https://corsproxy.io/?url='

/**
 * 通过 URL 获取并解析 RSS feed
 * 使用 CORS 代理绕过跨域限制
 */
export async function fetchAndParseRss(url: string): Promise<RssFeedInfo> {
  const proxyUrl = CORS_PROXY + encodeURIComponent(url)
  const response = await fetch(proxyUrl)

  if (!response.ok) {
    throw new Error(`获取 RSS 失败: HTTP ${response.status}`)
  }

  const text = await response.text()
  return parseRssXml(text)
}