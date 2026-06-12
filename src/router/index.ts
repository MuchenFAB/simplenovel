import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/read/:novelId',
      name: 'reader',
      component: () => import('@/views/ReaderView.vue'),
    },
    {
      path: '/read/:novelId/:chapterId',
      name: 'chapter',
      component: () => import('@/views/ChapterView.vue'),
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('@/views/EditorView.vue'),
    },
    {
      path: '/editor/:novelId',
      name: 'editorNovel',
      component: () => import('@/views/EditorView.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
    },
    {
      path: '/import',
      name: 'import',
      component: () => import('@/views/RssImportView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/404File.vue'),
    },
  ],
})

export default router