/**
 * 简易内容压缩工具
 *
 * 使用浏览器原生 CompressionStreams API（如不可用则回退到不压缩）。
 * 应对大量文字内容，减少 localStorage 占用。
 */

/** 检查 CompressionStreams 是否可用 */
function supportsCompression(): boolean {
  return typeof CompressionStream !== 'undefined' &&
         typeof DecompressionStream !== 'undefined'
}

/**
 * 将字符串转换为 Uint8Array
 */
function encodeText(text: string): Uint8Array {
  const encoder = new TextEncoder()
  return encoder.encode(text)
}

/**
 * 将 Uint8Array 转换为字符串
 */
function decodeText(buffer: Uint8Array): string {
  const decoder = new TextDecoder()
  return decoder.decode(buffer)
}

/**
 * 将 Uint8Array 转换为 Base64 字符串
 */
function toBase64(buffer: Uint8Array<ArrayBuffer>): string {
  let binary = ''
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i])
  }
  return btoa(binary)
}

/**
 * 将 Base64 字符串转换为 Uint8Array
 */
function fromBase64(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * 压缩字符串内容
 * 返回 `[compressed]` 前缀标记表示已压缩，方便解压时识别
 */
export async function compressContent(text: string): Promise<string> {
  if (!supportsCompression() || text.length < 256) {
    return text // 短内容不压缩，避免无效开销
  }

  try {
    const stream = new CompressionStream('gzip')
    const writer = stream.writable.getWriter()
    const reader = stream.readable.getReader()

    const chunks: Uint8Array[] = []
    const readPromise = (async () => {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
    })()

    writer.write(encodeText(text))
    writer.close()
    await readPromise

    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0)
    const merged = new Uint8Array(totalLength)
    let offset = 0
    for (const c of chunks) {
      merged.set(c, offset)
      offset += c.length
    }

    return '[compressed]' + toBase64(merged)
  } catch {
    return text // 压缩失败回退
  }
}

/**
 * 解压字符串内容
 */
export async function decompressContent(text: string): Promise<string> {
  if (!text.startsWith('[compressed]')) {
    return text
  }
  if (!supportsCompression()) {
    return text.slice('[compressed]'.length)
  }

  try {
    const base64Data = text.slice('[compressed]'.length)
    const compressed = fromBase64(base64Data)

    const stream = new DecompressionStream('gzip')
    const writer = stream.writable.getWriter()
    const reader = stream.readable.getReader()

    const chunks: Uint8Array[] = []
    const readPromise = (async () => {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
    })()

    writer.write(compressed)
    writer.close()
    await readPromise

    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0)
    const merged = new Uint8Array(totalLength)
    let offset = 0
    for (const c of chunks) {
      merged.set(c, offset)
      offset += c.length
    }

    return decodeText(merged)
  } catch {
    return text.slice('[compressed]'.length)
  }
}