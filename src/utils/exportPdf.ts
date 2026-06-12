import type { Novel, Chapter } from '@/types'

/**
 * 导出单章为 PDF
 */
export async function exportChapterPdf(chapter: Chapter, novelTitle: string): Promise<void> {
  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - margin * 2
    let y = margin

    // 标题
    doc.setFontSize(20)
    doc.setTextColor(44, 62, 80)
    doc.text(novelTitle, pageWidth / 2, y, { align: 'center' })
    y += 12

    // 章节标题
    doc.setFontSize(16)
    doc.text(chapter.title, pageWidth / 2, y, { align: 'center' })
    y += 10

    // 分隔线
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 8

    // 正文
    doc.setFontSize(12)
    doc.setTextColor(51, 51, 51)
    const paragraphs = chapter.content.split('\n').filter(Boolean)

    for (const para of paragraphs) {
      const lines = doc.splitTextToSize(para, contentWidth)
      const textHeight = lines.length * 7

      // 换页
      if (y + textHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage()
        y = margin
      }

      doc.text(lines, margin, y)
      y += textHeight + 4
    }

    doc.save(`${novelTitle}-${chapter.title}.pdf`)
  } catch (e) {
    console.error('PDF 导出失败:', e)
    alert('PDF 导出失败, 请稍后重试')
  }
}

/**
 * 导出整本小说为 PDF
 */
export async function exportNovelPdf(novel: Novel): Promise<void> {
  if (novel.chapters.length === 0) {
    alert('该作品暂无章节, 无法导出')
    return
  }

  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - margin * 2

    // 封面
    let y = 60
    doc.setFontSize(28)
    doc.setTextColor(44, 62, 80)
    doc.text(novel.title, pageWidth / 2, y, { align: 'center' })
    y += 16
    doc.setFontSize(14)
    doc.setTextColor(100, 100, 100)
    doc.text(`作者: ${novel.author}`, pageWidth / 2, y, { align: 'center' })
    y += 10
    doc.text(`共 ${novel.chapters.length} 章`, pageWidth / 2, y, { align: 'center' })

    // 逐章渲染
    for (let i = 0; i < novel.chapters.length; i++) {
      const ch = novel.chapters[i]
      doc.addPage()

      y = margin
      doc.setFontSize(18)
      doc.setTextColor(44, 62, 80)
      doc.text(ch.title, pageWidth / 2, y, { align: 'center' })
      y += 10

      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 8

      doc.setFontSize(12)
      doc.setTextColor(51, 51, 51)
      const paragraphs = ch.content.split('\n').filter(Boolean)

      for (const para of paragraphs) {
        const lines = doc.splitTextToSize(para, contentWidth)
        const textHeight = lines.length * 7

        if (y + textHeight > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage()
          y = margin
        }

        doc.text(lines, margin, y)
        y += textHeight + 4
      }
    }

    doc.save(`${novel.title}.pdf`)
  } catch (e) {
    console.error('PDF 导出失败:', e)
    alert('PDF 导出失败, 请稍后重试')
  }
}