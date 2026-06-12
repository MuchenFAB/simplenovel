import type { Novel, Chapter } from '@/types'

/**
 * 将文本内容渲染到 HTML 元素中
 */
function buildContentHtml(novelTitle: string, chapter: Chapter): HTMLDivElement {
  const container = document.createElement('div')
  container.style.cssText = `
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
    font-size: 14px;
    line-height: 2;
    color: #333;
    padding: 20px;
    background: #fff;
  `

  const titleEl = document.createElement('h1')
  titleEl.style.cssText = 'font-size:24px;text-align:center;margin:0 0 8px;color:#2c3e50;'
  titleEl.textContent = novelTitle
  container.appendChild(titleEl)

  const chapterTitleEl = document.createElement('h2')
  chapterTitleEl.style.cssText = 'font-size:18px;text-align:center;margin:0 0 16px;color:#2c3e50;'
  chapterTitleEl.textContent = chapter.title
  container.appendChild(chapterTitleEl)

  const divider = document.createElement('hr')
  divider.style.cssText = 'border:none;border-top:1px solid #ccc;margin:0 0 16px;'
  container.appendChild(divider)

  const paragraphs = chapter.content.split('\n').filter(Boolean)
  for (const para of paragraphs) {
    const p = document.createElement('p')
    p.style.cssText = 'margin:0 0 8px;text-indent:2em;'
    p.textContent = para
    container.appendChild(p)
  }

  return container
}

/**
 * 导出单章为 PDF（通过 html2canvas 渲染，支持中文）
 */
export async function exportChapterPdf(chapter: Chapter, novelTitle: string): Promise<void> {
  try {
    const [{ jsPDF }, html2canvas] = await Promise.all([
      import('jspdf'),
      import('html2canvas'),
    ])

    const container = buildContentHtml(novelTitle, chapter)
    // 必须挂到 DOM 中 html2canvas 才能正确渲染
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = '760px'
    document.body.appendChild(container)

    try {
      const canvas = await html2canvas.default(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')

      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 10
      const usableWidth = pageWidth - margin * 2
      const usableHeight = pageHeight - margin * 2

      const imgWidth = usableWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let remainingHeight = imgHeight
      let srcY = 0

      while (remainingHeight > 0) {
        const sliceHeight = Math.min(remainingHeight, usableHeight)
        const srcH = (sliceHeight / imgHeight) * canvas.height

        if (srcY > 0) {
          doc.addPage()
        }

        doc.addImage(
          imgData,
          'PNG',
          margin,
          margin,
          imgWidth,
          sliceHeight,
          undefined,
          'FAST',
        )

        srcY += srcH
        remainingHeight -= sliceHeight
      }

      doc.save(`${novelTitle}-${chapter.title}.pdf`)
    } finally {
      document.body.removeChild(container)
    }
  } catch (e) {
    console.error('PDF 导出失败:', e)
    alert('PDF 导出失败, 请稍后重试')
  }
}

/**
 * 导出整本小说为 PDF（通过 html2canvas 渲染，支持中文）
 */
export async function exportNovelPdf(novel: Novel): Promise<void> {
  if (novel.chapters.length === 0) {
    alert('该作品暂无章节, 无法导出')
    return
  }

  try {
    const [{ jsPDF }, html2canvas] = await Promise.all([
      import('jspdf'),
      import('html2canvas'),
    ])

    // 构建完整内容 HTML
    const container = document.createElement('div')
    container.style.cssText = `
      font-family: 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
      font-size: 14px;
      line-height: 2;
      color: #333;
      padding: 20px;
      background: #fff;
    `

    // 封面
    const coverTitle = document.createElement('h1')
    coverTitle.style.cssText = 'font-size:28px;text-align:center;margin:0 0 12px;color:#2c3e50;'
    coverTitle.textContent = novel.title
    container.appendChild(coverTitle)

    const coverAuthor = document.createElement('p')
    coverAuthor.style.cssText = 'font-size:16px;text-align:center;margin:0 0 6px;color:#666;'
    coverAuthor.textContent = `作者: ${novel.author}`
    container.appendChild(coverAuthor)

    const coverCount = document.createElement('p')
    coverCount.style.cssText = 'font-size:14px;text-align:center;margin:0 0 24px;color:#888;'
    coverCount.textContent = `共 ${novel.chapters.length} 章`
    container.appendChild(coverCount)

    // 逐章内容
    for (const ch of novel.chapters) {
      const chTitle = document.createElement('h2')
      chTitle.style.cssText = 'font-size:20px;margin:24px 0 12px;color:#2c3e50;page-break-before:always;'
      chTitle.textContent = ch.title
      container.appendChild(chTitle)

      const divider = document.createElement('hr')
      divider.style.cssText = 'border:none;border-top:1px solid #ccc;margin:0 0 12px;'
      container.appendChild(divider)

      const paragraphs = ch.content.split('\n').filter(Boolean)
      for (const para of paragraphs) {
        const p = document.createElement('p')
        p.style.cssText = 'margin:0 0 8px;text-indent:2em;'
        p.textContent = para
        container.appendChild(p)
      }
    }

    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = '760px'
    document.body.appendChild(container)

    try {
      const canvas = await html2canvas.default(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')

      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 10
      const usableWidth = pageWidth - margin * 2
      const usableHeight = pageHeight - margin * 2

      const imgWidth = usableWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let remainingHeight = imgHeight
      let srcY = 0

      while (remainingHeight > 0) {
        const sliceHeight = Math.min(remainingHeight, usableHeight)
        const srcH = (sliceHeight / imgHeight) * canvas.height

        if (srcY > 0) {
          doc.addPage()
        }

        doc.addImage(
          imgData,
          'PNG',
          margin,
          margin,
          imgWidth,
          sliceHeight,
          undefined,
          'FAST',
        )

        srcY += srcH
        remainingHeight -= sliceHeight
      }

      doc.save(`${novel.title}.pdf`)
    } finally {
      document.body.removeChild(container)
    }
  } catch (e) {
    console.error('PDF 导出失败:', e)
    alert('PDF 导出失败, 请稍后重试')
  }
}