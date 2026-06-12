<script setup lang="ts">
import { useNovelStore } from '@/stores/novel'
import NovelCard from '@/components/NovelCard.vue'
import { useRouter } from 'vue-router'

const store = useNovelStore()
const router = useRouter()

function goToEditor() {
  router.push('/editor')
}
</script>

<template>
  <div class="home">
    <div class="home-hero">
      <h1>📚 书架</h1>
      <p class="hero-subtitle">您的创作，随时翻阅，随心阅读</p>
    </div>

    <div v-if="store.novels.length === 0" class="vp-empty">
      <p>📭 书架空空如也，快去创作第一本小说吧</p>
    </div>

    <div v-else class="vp-grid">
      <NovelCard
        v-for="novel in store.novels"
        :key="novel.id"
        :novel="novel"
      />
    </div>
  </div>
</template>

<style scoped>
.home-hero {
  text-align: center;
  padding: 48px 0 32px;
}

.home-hero h1 {
  font-size: 2.2rem;
  margin: 0 0 8px;
  color: var(--vp-c-text);
}

.hero-subtitle {
  color: var(--vp-c-text-lighter);
  font-size: 15px;
  margin: 0 0 24px;
}

.vp-btn-primary {
  display: inline-block;
  background: var(--vp-c-brand);
  color: #fff;
  border: none;
  padding: 10px 28px;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.vp-btn-primary:hover {
  background: var(--vp-c-brand-dark);
  transform: translateY(-1px);
}

.vp-btn-primary:active {
  transform: translateY(0);
}

.vp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  padding-bottom: 40px;
}

.vp-empty {
  text-align: center;
  padding: 80px 20px;
  color: var(--vp-c-text-lighter);
  font-size: 15px;
}
</style>