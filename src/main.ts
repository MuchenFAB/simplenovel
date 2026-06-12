import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { siteConfig } from './config'

import './styles/global.css'

const app = createApp(App)

// 注入全局站点配置
app.provide('siteConfig', siteConfig)

app.use(createPinia())
app.use(router)

app.mount('#app')

// 页面标题跟随配置
document.title = siteConfig.siteName