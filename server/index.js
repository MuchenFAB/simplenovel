import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = 3001

// 数据存储目录
const DATA_DIR = join(__dirname, 'data')
const DATA_FILE = join(DATA_DIR, 'novels.json')

app.use(cors())
app.use(express.json({ limit: '50mb' }))

// 确保数据目录存在
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

// 读取小说数据
function loadNovels() {
  if (!existsSync(DATA_FILE)) {
    return []
  }
  try {
    const raw = readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

// 保存小说数据
function saveNovels(novels) {
  writeFileSync(DATA_FILE, JSON.stringify(novels, null, 2), 'utf-8')
}

// ==================== API 路由 ====================

// GET /api/simplenovel/novels - 获取所有小说
app.get('/api/simplenovel/novels', (_req, res) => {
  try {
    const novels = loadNovels()
    res.json(novels)
  } catch (e) {
    console.error('读取数据失败:', e)
    res.status(500).json({ error: '读取数据失败' })
  }
})

// PUT /api/simplenovel/novels - 保存所有小说
app.put('/api/simplenovel/novels', (req, res) => {
  try {
    const novels = req.body
    saveNovels(novels)
    res.json({ success: true, count: novels.length })
  } catch (e) {
    console.error('保存数据失败:', e)
    res.status(500).json({ error: '保存数据失败' })
  }
})

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', storage: 'file' })
})

app.listen(PORT, () => {
  console.log(`📚 SimpleNovel 数据服务已启动`)
  console.log(`   → http://localhost:${PORT}`)
  console.log(`   → 数据文件: ${DATA_FILE}`)
})