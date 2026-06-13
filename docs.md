# SimpleNovel 调试指南

## 1. 项目架构速览

```
浏览器 (localhost:3000)
  │
  ├── Vite 开发服务器 (端口 3000)
  │     ├── 提供 Vue 前端静态资源 + HMR
  │     └── /api/* 代理 → http://localhost:3001
  │
  └── Express 后端 (端口 3001, server/index.js)
        └── server/data/novels.json (数据文件)
```

## 2. 启动方式

```bash
# 一键启动前后端（推荐调试用）
npm run dev

# 仅启动后端（调试 API 时用）
npm run dev:server

# 仅启动前端
npm run dev:app
```

VS Code 调试：按 `F5` → 选择 **「启动后端服务 (server)」** 可单独调试后端，支持断点。

## 3. 数据流追踪

### 3.1 启动加载流程

```
main.ts
  └─ siteConfig.useMongoDB === true
       └─ createMongoApi('', 'simplenovel')
            └─ endpoint('/novels') → '/api/simplenovel/novels'
                 └─ fetch GET → Vite 代理 → Express → novels.json
                      └─ novels.value = [...]

useNovelStore (Pinia)
  └─ 启动时调用 api.getAllNovels()
  └─ 所有 CRUD 后调用 api.saveNovels(novels)
```

### 3.2 关键断点位置

| 位置 | 文件 | 行号 | 作用 |
|------|------|------|------|
| API 入口 | `src/api/novelApi.ts` | 41-49 | GET 请求，观察返回数据 |
| API 入口 | `src/api/novelApi.ts` | 51-61 | PUT 请求，观察保存数据 |
| Store 初始化 | `src/stores/novel.ts` | 22-38 | 启动加载，数据迁移 |
| Store 持久化 | `src/stores/novel.ts` | 225-227 | 每次操作后的 saveNovels 调用 |
| 后端 GET | `server/index.js` | 46-52 | 服务端读取 novels.json |
| 后端 PUT | `server/index.js` | 55-61 | 服务端写入 novels.json |

## 4. 常见问题排查

### 4.1 书架为空

**症状**：访问首页看到「📭 书架空空如也」

**排查步骤**：

```bash
# 1. 检查后端是否运行
curl http://localhost:3001/api/health
# 预期输出: {"status":"ok","storage":"file"}

# 2. 检查数据文件是否存在
dir server\data\novels.json
# 或 cat server/data/novels.json

# 3. 直接调用 API 查看数据
curl http://localhost:3001/api/simplenovel/novels

# 4. 检查浏览器控制台
#    打开 F12 → Network → 找到 /api/simplenovel/novels 请求
#    查看响应状态码和返回内容
```

**如果是首次运行**：`novels.json` 不存在时后端返回 `[]` 是正常的。
**如果之前有 localStorage 数据**：旧数据不会自动迁移到服务端，需要手动操作。

### 4.2 后端启动失败

```bash
# 检查端口是否被占用
netstat -ano | findstr :3001

# 如果被占用，结束进程或修改 server/index.js 中的 PORT 常量
```

### 4.3 Vite 代理不生效

确认 `vite.config.ts` 中的 proxy 配置：
```ts
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  },
},
```

**验证代理**：
1. 启动后端 `npm run dev:server`
2. 启动前端 `npm run dev:app`
3. 浏览器访问 `http://localhost:3000/api/health`
4. 应返回 `{"status":"ok","storage":"file"}`

### 4.4 数据没有保存

**检查项**：
1. 后端是否正在运行
2. `server/data/` 目录是否存在（后端启动时会自动创建）
3. 文件系统是否有写入权限
4. 检查浏览器 Console 是否有 `MongoDB 写入失败` 警告
5. 浏览器 F12 → Network → PUT `/api/simplenovel/novels` → 查看 Response

### 4.5 CORS 跨域错误

项目已内置 `cors()` 中间件（`server/index.js` 第 13 行），允许所有来源。
如果仍有 CORS 错误，检查：
- 是否通过 Vite 代理访问（不应直接访问 3001）
- 生产部署时 Nginx 是否配置了 `/api/` 代理

## 5. 存储模式切换

修改 `src/config/index.ts`，然后重启前后端：

| 需求 | 配置 |
|------|------|
| 服务端共享（默认） | `useMongoDB: true`, `mongoBaseUrl: ''` |
| 每人独立书架 | `useMongoDB: false` |
| 外部 MongoDB | `useMongoDB: true`, `mongoBaseUrl: 'http://your-server:3001'` |

## 6. 数据备份与恢复

```bash
# 备份数据
copy server\data\novels.json server\data\novels_backup.json

# 恢复数据
copy server\data\novels_backup.json server\data\novels.json
```

**警告**：SAVE 操作是全量覆盖（PUT），不是增量更新。所有用户操作共享同一份数据，并发写入可能导致数据丢失。这是当前设计的已知限制。

## 7. 调试技巧

### 7.1 查看当前数据状态

在浏览器控制台中执行：
```javascript
// 查看 Pinia store 中的 novels 数据
// (需要 Vue DevTools 或访问 window)
```

### 7.2 手动写入测试数据

```javascript
// 在 Node.js 中执行
fetch('http://localhost:3001/api/simplenovel/novels', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify([
    {
      id: 'test1',
      title: '测试小说',
      author: '调试',
      chapters: [
        { id: 'c1', title: '第一章', content: '测试内容', createdAt: Date.now(), updatedAt: Date.now() }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ])
}).then(r => r.json()).then(console.log)
```

### 7.3 重置数据

```bash
# 删除数据文件，重启后端会自动创建空数组
del server\data\novels.json
```

### 7.4 监控 API 请求

所有 API 请求在浏览器 F12 → Network 中过滤 `/api/` 即可查看。

## 8. 关键文件索引

| 文件 | 作用 | 调试重点 |
|------|------|----------|
| `src/main.ts` | 应用入口，选择存储后端 | `useMongoDB` 分支 |
| `src/api/novelApi.ts` | API 实现层 | `fetch` 请求 URL、响应 |
| `src/stores/novel.ts` | 数据状态管理 | `novels` 数据、`persist()` 调用 |
| `src/config/index.ts` | 全局配置 | `useMongoDB` 开关 |
| `vite.config.ts` | 构建配置 | `/api` 代理目标 |
| `server/index.js` | 后端服务 | 路由、数据读写 |
| `server/data/novels.json` | 数据文件 | 当前存储内容 |