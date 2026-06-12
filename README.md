# SimpleNovel

_本项目源码绝大部分使用`DeepSeek-V4-Pro`生成 修改时请注意甄别_

> ### 轻量, 简洁, 开箱即用的小说连载阅读与创作系统

SimpleNovel 是一款基于 **Vue 3.0** 构建的 **开源简易小说连载平台**. 聚焦最核心的功能: **阅读文字** 与 **上传文字**, 支持分章节管理, 无账户系统, 无复杂依赖, 打开即用.

---

### ✨ 功能

- **阅读文字** - 沉浸式小说在线阅读体验
- **上传文字** - 自由上传小说内容, 支持分章节管理
- **分章节管理** - 清晰的作品章节目录, 阅读与创作互不干扰

---

### 🧰 技术栈

| 层级         | 技术选型            |
| ------------ | ------------------- |
| **前端框架** | Vue 3.0             |
| **构建工具** | Vite                |
| **后端框架** | Node.js 24  |
| **后端打包** | npm                 |
| **数据库(可选)**|MongoDB|

---

### 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/MuchenFAB/simplenovel.git
cd simplenovel

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

---

### 🏭 生产环境部署

SimpleNovel 是**纯静态前端项目**, `npm run build` 后 `dist/` 目录即为完整站点. 部署到任意 Web 服务器即可.

#### 方案一: Nginx (推荐)

将 `dist/` 内容复制到 Nginx 站点目录, 配置 SPA 路由回退:

```nginx
server {
    listen       80;
    server_name  your-domain.com;
    root         /var/www/simplenovel;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript text/plain application/json;
}
```

#### 方案二: Vercel / Netlify

- **Vercel**: 导入 Git 仓库 -> 框架选 Vite -> 构建命令 `npm run build` -> 输出目录 `dist`
- **Netlify**: 导入项目 -> Build command `npm run build` -> Publish directory `dist`

---

### 数据存储

SimpleNovel 默认使用 **localStorage** 存储数据, 无需额外配置, 开箱即用.

如需将数据迁移到 MongoDB, 可启用内置的 MongoDB 接口:

1. 在 `src/config/index.ts` 中修改配置:

```ts
useMongoDB: true,                      // 启用 MongoDB 存储
mongoBaseUrl: 'http://localhost:3001', // MongoDB REST API 地址
mongoDbName: 'simplenovel',           // 数据库名称
```

2. 后端需提供以下 REST API:

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/{dbName}/novels` | 获取所有小说 |
| PUT | `/api/{dbName}/novels` | 保存所有小说 |

3. 重新构建部署即可切换

> `src/api/novelApi.ts` 提供了 `createLocalApi()` 和 `createMongoApi()` 两种实现, 通过 `src/main.ts` 中的 config 开关自动选择.

---

### 📁 项目结构

```
simplenovel/
├── src/
│   ├── config/         # 配置中心
│   ├── components/     # 通用组件
│   ├── views/          # 页面视图
│   ├── stores/         # 状态管理
│   ├── router/         # 路由配置
│   ├── types/          # 类型定义
│   ├── utils/          # 工具函数
│   └── styles/         # 全局样式
├── public/             # 静态资源
├── footbar.md          # 底部备案栏内容
├── index.html          # 入口 HTML
├── vite.config.ts      # Vite 配置
├── tsconfig.json       # TypeScript 配置
└── README.md           # 本文件
```

---

### 📄 开源协议

本项目基于 **`Apache 2.0 协议`** 开源, 详情请查看 [LICENSE](./LICENSE) 文件.

---

<p align="center">
  <sub><em>⚡Unlimited Progress⚡</em></sub>
</p>
