# SimpleNovel

_本项目源码绝大部分使用`DeepSeek-V4-Pro`生成 修改时请注意甄别_

> ### 轻量, 简洁, 开箱即用的小说连载阅读与创作系统

SimpleNovel 是一款基于 **Vue 3.0** 构建的 **开源简易小说连载平台**. 聚焦最核心的功能: **阅读文字** 与 **上传文字**, 支持分章节管理, 无账户系统, 无复杂依赖, 打开即用. [演示站点](https://simnovle.muchen-libs.icu/)


---

### ✨ 功能

- **阅读文字** - 沉浸式小说在线阅读体验
- **上传文字** - 自由上传小说内容, 支持分章节管理
- **分章节管理** - 清晰的作品章节目录, 阅读与创作互不干扰
- **RSS 导入** - 粘贴 RSS 订阅地址一键导入文章，自动提取作者、标题、内容
- **每日自动同步** - 对已导入的 RSS 源每日自动拉取新章节

---

### 🧰 技术栈

| 层级         | 技术选型            |
| ------------ | ------------------- |
| **前端框架** | Vue 3.0             |
| **构建工具** | Vite                |
| **后端框架** | Express 5.x         |
| **数据存储** | JSON 文件 (服务端)  |
| **数据库 (可选)** | MongoDB         |

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

SimpleNovel 包含 **前端静态文件** 和 **Express 后端服务** 两部分，部署时需要同时运行两者。

#### 方案一: Nginx + PM2 (推荐)

**1. 构建前端**
```bash
npm run build        # 输出到 dist/
```

**2. 部署前端 (Nginx)**

将 `dist/` 复制到 Nginx 站点目录，配置 SPA 回退 + API 代理:

```nginx
server {
    listen       80;
    server_name  your-domain.com;
    root         /var/www/simplenovel;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript text/plain application/json;
}
```

**3. 启动后端 (PM2)**
```bash
npm install -g pm2
pm2 start server/index.js --name simplenovel-server
pm2 save
pm2 startup
```

#### 方案二: Vercel / Netlify

仅部署前端静态文件，数据仍使用浏览器 localStorage。

- **Vercel**: 导入 Git 仓库 -> 框架选 Vite -> 构建命令 `npm run build` -> 输出目录 `dist`
- **Netlify**: 导入项目 -> Build command `npm run build` -> Publish directory `dist`

#### 方案三: GitHub Pages

仓库已包含 `action/.github/workflows/main.yml`，推送 `action` 分支后自动构建并部署到 GitHub Pages。

1. 在仓库 **Settings → Pages** 中将 Source 设为 **Branch** 根目录选择"/" 配置自定义域名
2. 推送代码 → 自动构建 → 部署到 `https://exp.example.exp/`

---

### 数据存储

SimpleNovel 默认使用 **Express 后端 + JSON 文件** 存储数据（`server/data/novels.json`），所有访问者共享同一份书架内容。

如需切换回浏览器本地存储（每人独立书架），修改 `src/config/index.ts`:

```ts
useMongoDB: false,                     // 关闭服务端存储
```

三种存储模式对比:

| 模式 | useMongoDB | mongoBaseUrl | 数据位置 | 多设备共享 |
|------|------------|-------------|----------|-----------|
| **服务端 JSON 文件** (默认) | `true` | `''` | `server/data/novels.json` | ✅ |
| **MongoDB** | `true` | `http://...` | MongoDB 数据库 | ✅ |
| **localStorage** | `false` | — | 浏览器本地 | ❌ (每人独立) |

后端需提供以下 REST API (与 `server/index.js` 内置实现一致):

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/{dbName}/novels` | 获取所有小说 |
| PUT | `/api/{dbName}/novels` | 保存所有小说 |

> `src/api/novelApi.ts` 提供了 `createLocalApi()` 和 `createMongoApi()` 两种实现, 通过 `src/main.ts` 中的 config 开关自动选择.

---

### 📁 项目结构

```
simplenovel/
├── .github/
│   └── workflows/      # CI/CD 自动部署
├── server/
│   ├── index.js        # Express 后端服务 (端口 3001)
│   └── data/           # JSON 数据文件 (novels.json)
├── src/
│   ├── api/            # 数据访问层 (localStorage / MongoDB)
│   ├── config/         # 配置中心
│   ├── components/     # 通用组件
│   ├── views/          # 页面视图
│   ├── stores/         # 状态管理
│   ├── router/         # 路由配置
│   ├── types/          # 类型定义
│   ├── utils/          # 工具函数 (含 RSS 解析)
│   └── styles/         # 全局样式
├── public/             # 静态资源
├── footbar.md          # 底部备案栏内容
├── index.html          # 入口 HTML
├── vite.config.ts      # Vite 配置
├── tsconfig.json       # TypeScript 配置
├── package.json        # 依赖与启动脚本
└── README.md           # 本文件
```

---

### 📡 RSS 导入与同步

SimpleNovel 支持从 RSS 订阅源导入文章，将整条 feed 作为一部作品，每个 `<item>` 作为一个独立章节。

#### 导入方式

1. 点击导航栏 **「导入」** 进入 RSS 导入页面
2. 粘贴 RSS 订阅地址（如 `https://example.com/feed.xml`）
3. 点击「获取预览」查看 feed 标题、作者及前 10 篇文章
4. 确认导入后自动创建作品，跳转到阅读页

#### 重复导入

重复导入同一 RSS URL 时，仅追加**标题不重复**的新章节到已有作品中，不会创建重复作品。

#### 每日自动同步

应用启动时自动检查所有 RSS 导入的作品，若距离上次同步超过 24 小时，则拉取 RSS 并追加新章节。（可通过 `src/config/index.ts` 中的 `enableRssAutoSync` 开关控制）

> RSS 获取依赖 CORS 代理 (`corsproxy.io`)，若代理不可用可替换 `src/utils/rssParser.ts` 中的 `CORS_PROXY` 常量。

---

### 📄 开源协议

本项目基于 **`Apache 2.0 协议`** 开源, 详情请查看 [LICENSE](./LICENSE) 文件.

---

<p align="center">
  <sub><em>⚡Unlimited Progress⚡</em></sub>
</p>
