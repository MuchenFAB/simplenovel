import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { siteConfig } from './config'
import { createLocalApi, createMongoApi } from './api/novelApi'

import './styles/global.css'

const app = createApp(App)

// 根据配置选择数据存储后端
const novelApi = siteConfig.useMongoDB
  ? createMongoApi(siteConfig.mongoBaseUrl, siteConfig.mongoDbName)
  : createLocalApi()

// 注入全局依赖
app.provide('siteConfig', siteConfig)
app.provide('novelApi', novelApi)

app.use(createPinia())
app.use(router)

app.mount('#app')

document.title = siteConfig.siteName
