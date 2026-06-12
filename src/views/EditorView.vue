<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNovelStore } from '@/stores/novel'
import footbarRaw from '../../footbar.md?raw'

const route = useRoute()
const router = useRouter()
const store = useNovelStore()

const novelId = computed(() => route.params.novelId as string | undefined)
const isEditing = computed(() => !!novelId.value)
const existingNovel = computed(() => {
  if (!novelId.value) return undefined
  return store.getNovelById(novelId.value)
})

const novelTitle = ref('')
const novelAuthor = ref('')

const chapterTitle = ref('')
const chapterContent = ref('')
const editingChapterId = ref<string | null>(null)

const chapters = computed(() => existingNovel.value?.chapters ?? [])

// 简单 Markdown 解析 → HTML 行数组
const footbarLines = computed(() => {
  return footbarRaw
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      if (line.startsWith('# ')) {
        return { type: 'h1', text: line.slice(2) }
      }
      if (line.startsWith('- ')) {
        return { type: 'li', text: line.slice(2) }
      }
      if (line.startsWith('> ')) {
        return { type: 'quote', text: line.slice(2) }
      }
      return { type: 'p', text: line }
    })
})

onMounted(() => {
  if (existingNovel.value) {
    novelTitle.value = existingNovel.value.title
    novelAuthor.value = existingNovel.value.author
  }
})

function saveNovelMeta() {
  if (!novelTitle.value.trim()) {
    alert('请输入作品名称')
    return
  }

  if (isEditing.value && novelId.value) {
    store.updateNovel(novelId.value, {
      title: novelTitle.value.trim(),
      author: novelAuthor.value.trim() || '未知作者',
    })
  } else {
    const novel = store.createNovel(
      novelTitle.value.trim(),
      novelAuthor.value.trim() || '未知作者'
    )
    router.replace(`/editor/${novel.id}`)
  }
  alert('作品信息已保存')
}

function startAddChapter() {
  editingChapterId.value = null
  chapterTitle.value = ''
  chapterContent.value = ''
}

function startEditChapter(chapterId: string) {
  const chapter = store.getChapterById(novelId.value!, chapterId)
  if (!chapter) return
  editingChapterId.value = chapterId
  chapterTitle.value = chapter.title
  chapterContent.value = chapter.content
}

function saveChapter() {
  if (!chapterTitle.value.trim()) {
    alert('请输入章节标题')
    return
  }
  if (!novelId.value) {
    alert('请先保存作品信息')
    return
  }

  if (editingChapterId.value) {
    store.updateChapter(novelId.value, editingChapterId.value, {
      title: chapterTitle.value.trim(),
      content: chapterContent.value,
    })
  } else {
    store.addChapter(novelId.value, chapterTitle.value.trim(), chapterContent.value)
  }

  startAddChapter()
}

function deleteChapter(chapterId: string) {
  if (!confirm('确定要删除该章节吗？')) return
  store.deleteChapter(novelId.value!, chapterId)
}

function cancelChapterEdit() {
  startAddChapter()
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="vp-content">
    <button class="vp-back-link" @click="goBack">← 返回书架</button>

    <h1>{{ isEditing ? '编辑作品' : '新建作品' }}</h1>

    <!-- 作品基本信息 -->
    <section class="vp-section">
      <h2>作品信息</h2>
      <div class="vp-form-group">
        <label>作品名称</label>
        <input
          v-model="novelTitle"
          type="text"
          placeholder="请输入作品名称"
          class="vp-input"
        />
      </div>
      <div class="vp-form-group">
        <label>作者</label>
        <input
          v-model="novelAuthor"
          type="text"
          placeholder="请输入作者名"
          class="vp-input"
        />
      </div>
      <button class="vp-btn" @click="saveNovelMeta">保存作品信息</button>
    </section>

    <!-- 章节管理 -->
    <section v-if="isEditing && novelId" class="vp-section">
      <h2>章节管理</h2>

      <div v-if="chapters.length > 0" class="vp-chapter-list">
        <div
          v-for="(chapter, index) in chapters"
          :key="chapter.id"
          class="vp-chapter-row"
        >
          <span class="chapter-num">{{ index + 1 }}.</span>
          <span class="chapter-name">{{ chapter.title }}</span>
          <div class="chapter-actions">
            <button class="vp-btn-sm" @click="startEditChapter(chapter.id)">编辑</button>
            <button class="vp-btn-sm vp-btn-sm--danger" @click="deleteChapter(chapter.id)">删除</button>
          </div>
        </div>
      </div>
      <div v-else class="vp-empty">
        <p>暂无章节，在下方添加</p>
      </div>

      <div class="vp-chapter-editor">
        <h3>{{ editingChapterId ? '编辑章节' : '新增章节' }}</h3>
        <div class="vp-form-group">
          <label>章节标题</label>
          <input
            v-model="chapterTitle"
            type="text"
            placeholder="请输入章节标题"
            class="vp-input"
          />
        </div>
        <div class="vp-form-group">
          <label>章节内容</label>
          <textarea
            v-model="chapterContent"
            placeholder="请输入章节内容……"
            class="vp-textarea"
            rows="12"
          ></textarea>
        </div>
        <div class="vp-form-actions">
          <button class="vp-btn" @click="saveChapter">
            {{ editingChapterId ? '保存修改' : '添加章节' }}
          </button>
          <button v-if="editingChapterId" class="vp-btn vp-btn--secondary" @click="cancelChapterEdit">
            取消编辑
          </button>
        </div>
      </div>
    </section>

    <div v-else-if="!isEditing" class="vp-empty">
      <p>💡 请先填写作品信息并保存，然后即可添加章节</p>
    </div>

    <!-- ===== 底栏 ===== -->
    <footer class="vp-footbar">
      <div class="vp-footbar-inner">
        <template v-for="(line, i) in footbarLines" :key="i">
          <strong v-if="line.type === 'h1'" class="footbar-h1">{{ line.text }}</strong>
          <span v-else-if="line.type === 'li'" class="footbar-li">{{ line.text }}</span>
          <em v-else-if="line.type === 'quote'" class="footbar-quote">{{ line.text }}</em>
          <span v-else class="footbar-p">{{ line.text }}</span>
        </template>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.vp-content {
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.vp-back-link {
  display: inline-block;
  background: none;
  border: none;
  color: var(--vp-c-brand);
  font-size: 14px;
  padding: 0;
  margin-bottom: 20px;
  font-weight: 500;
}

.vp-back-link:hover {
  color: var(--vp-c-brand-dark);
  text-decoration: underline;
}

.vp-content > h1 {
  font-size: 2rem;
  margin: 0 0 28px;
}

/* Section 卡片 */
.vp-section {
  margin-bottom: 32px;
  padding: 24px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: var(--vp-radius);
}

.vp-section h2 {
  font-size: 1.1rem;
  margin: 0 0 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-border);
}

/* 表单通用 */
.vp-form-group {
  margin-bottom: 16px;
}

.vp-form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-light);
  margin-bottom: 6px;
}

.vp-input,
.vp-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--vp-c-border);
  border-radius: var(--vp-radius);
  font-size: 15px;
  font-family: inherit;
  color: var(--vp-c-text);
  background: var(--vp-c-bg);
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  resize: vertical;
}

.vp-input:focus,
.vp-textarea:focus {
  border-color: var(--vp-c-brand);
  box-shadow: 0 0 0 3px rgba(62, 175, 124, 0.15);
}

.vp-textarea {
  line-height: 1.8;
}

/* 按钮 */
.vp-btn {
  background: var(--vp-c-brand);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.vp-btn:hover {
  background: var(--vp-c-brand-dark);
  transform: translateY(-1px);
}

.vp-btn:active {
  transform: translateY(0);
}

.vp-btn--secondary {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text);
  margin-left: 8px;
}

.vp-btn--secondary:hover {
  background: var(--vp-c-border);
}

.vp-form-actions {
  margin-top: 12px;
}

/* 章节列表 */
.vp-chapter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--vp-c-border);
  transition: background 0.15s;
}

.vp-chapter-row:hover {
  background: var(--vp-c-bg-mute);
}

.chapter-num {
  color: var(--vp-c-text-lighter);
  min-width: 28px;
  font-size: 14px;
}

.chapter-name {
  flex: 1;
  color: var(--vp-c-text);
  font-size: 14px;
  font-weight: 500;
}

.chapter-actions {
  display: flex;
  gap: 6px;
}

.vp-btn-sm {
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-border);
  padding: 4px 12px;
  border-radius: var(--vp-radius-sm);
  font-size: 12px;
  cursor: pointer;
  color: var(--vp-c-text-light);
  font-weight: 500;
  transition: all 0.15s;
}

.vp-btn-sm:hover {
  border-color: var(--vp-c-brand-lighter);
  color: var(--vp-c-brand);
}

.vp-btn-sm--danger:hover {
  border-color: #e74c3c;
  color: #e74c3c;
  background: #fef0ef;
}

/* 章节编辑器 */
.vp-chapter-editor {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--vp-c-border);
}

.vp-chapter-editor h3 {
  font-size: 1rem;
  margin: 0 0 14px;
}

.vp-empty {
  text-align: center;
  padding: 40px 0;
  color: var(--vp-c-text-lighter);
  font-size: 14px;
}

/* ===== 底栏 ===== */
.vp-footbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--vp-c-bg);
  border-top: 1px solid var(--vp-c-border);
  z-index: 95;
  padding: 10px 0;
  transition: var(--vp-transition);
}

.vp-footbar-inner {
  max-width: var(--vp-content-max-width);
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 16px;
  font-size: 13px;
  color: var(--vp-c-text-lighter);
}

.footbar-h1 {
  color: var(--vp-c-text);
  font-size: 13px;
  width: 100%;
  margin-bottom: 2px;
}

.footbar-li {
  display: inline-block;
  color: var(--vp-c-text-light);
}

.footbar-quote {
  color: var(--vp-c-brand);
  font-style: italic;
  font-weight: 500;
}

.footbar-p {
  color: var(--vp-c-text-lighter);
}
</style>