<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNovelStore } from '@/stores/novel'

const route = useRoute()
const router = useRouter()
const store = useNovelStore()

const novelId = computed(() => route.params.novelId as string | undefined)
const isEditing = computed(() => !!novelId.value)
const existingNovel = computed(() => {
  if (!novelId.value) return undefined
  return store.getNovelById(novelId.value)
})

// 小说基本信息
const novelTitle = ref('')
const novelAuthor = ref('')

// 章节编辑
const chapterTitle = ref('')
const chapterContent = ref('')
const editingChapterId = ref<string | null>(null)

const chapters = computed(() => existingNovel.value?.chapters ?? [])

onMounted(() => {
  if (existingNovel.value) {
    novelTitle.value = existingNovel.value.title
    novelAuthor.value = existingNovel.value.author
  }
})

// --- 小说操作 ---
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

// --- 章节操作 ---
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
  <div class="editor">
    <button class="btn-back" @click="goBack">← 返回首页</button>

    <h1>{{ isEditing ? '编辑作品' : '新建作品' }}</h1>

    <!-- 作品基本信息 -->
    <section class="section novel-meta">
      <h2>作品信息</h2>
      <div class="form-group">
        <label>作品名称</label>
        <input
          v-model="novelTitle"
          type="text"
          placeholder="请输入作品名称"
          class="input"
        />
      </div>
      <div class="form-group">
        <label>作者</label>
        <input
          v-model="novelAuthor"
          type="text"
          placeholder="请输入作者名"
          class="input"
        />
      </div>
      <button class="btn-primary" @click="saveNovelMeta">保存作品信息</button>
    </section>

    <!-- 章节管理 -->
    <section v-if="isEditing && novelId" class="section chapters-section">
      <h2>章节管理</h2>

      <!-- 已有章节列表 -->
      <div v-if="chapters.length > 0" class="chapters-list">
        <div
          v-for="(chapter, index) in chapters"
          :key="chapter.id"
          class="chapter-row"
        >
          <span class="chapter-num">{{ index + 1 }}.</span>
          <span class="chapter-name">{{ chapter.title }}</span>
          <div class="chapter-actions">
            <button class="btn-sm" @click="startEditChapter(chapter.id)">编辑</button>
            <button class="btn-sm btn-danger" @click="deleteChapter(chapter.id)">删除</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-hint">
        <p>暂无章节，在下方添加</p>
      </div>

      <!-- 编辑/新增章节 -->
      <div class="chapter-editor">
        <h3>{{ editingChapterId ? '编辑章节' : '新增章节' }}</h3>
        <div class="form-group">
          <label>章节标题</label>
          <input
            v-model="chapterTitle"
            type="text"
            placeholder="请输入章节标题"
            class="input"
          />
        </div>
        <div class="form-group">
          <label>章节内容</label>
          <textarea
            v-model="chapterContent"
            placeholder="请输入章节内容……"
            class="textarea"
            rows="12"
          ></textarea>
        </div>
        <div class="editor-actions">
          <button class="btn-primary" @click="saveChapter">
            {{ editingChapterId ? '保存修改' : '添加章节' }}
          </button>
          <button v-if="editingChapterId" class="btn-secondary" @click="cancelChapterEdit">
            取消编辑
          </button>
        </div>
      </div>
    </section>

    <!-- 新建作品时先提醒保存 -->
    <div v-else-if="!isEditing" class="empty-hint">
      <p>💡 请先填写作品信息并保存，然后即可添加章节</p>
    </div>
  </div>
</template>

<style scoped>
.editor {
  max-width: 720px;
  margin: 0 auto;
}

.btn-back {
  background: none;
  border: none;
  color: #4a90d9;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  margin-bottom: 16px;
}

h1 {
  font-size: 24px;
  margin: 0 0 24px;
}

.section {
  margin-bottom: 32px;
  padding: 20px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #eee;
}

.section h2 {
  font-size: 16px;
  margin: 0 0 16px;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.input,
.textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: #4a90d9;
  box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.15);
}

.textarea {
  resize: vertical;
  line-height: 1.8;
}

.btn-primary {
  background: #4a90d9;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #3a7bc8;
}

.btn-secondary {
  background: #e8ecf1;
  color: #333;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-left: 8px;
}

.btn-secondary:hover {
  background: #d8dce3;
}

.chapter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.chapter-num {
  color: #999;
  min-width: 28px;
}

.chapter-name {
  flex: 1;
  color: #333;
  font-size: 14px;
}

.chapter-actions {
  display: flex;
  gap: 6px;
}

.btn-sm {
  background: #f0f0f0;
  border: 1px solid #ddd;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  color: #555;
}

.btn-sm:hover {
  background: #e0e0e0;
}

.btn-danger {
  color: #d94a4a;
  border-color: #f5c6c6;
}

.btn-danger:hover {
  background: #fce8e8;
}

.chapter-editor {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.chapter-editor h3 {
  font-size: 15px;
  margin: 0 0 12px;
}

.editor-actions {
  margin-top: 8px;
}

.empty-hint {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}
</style>