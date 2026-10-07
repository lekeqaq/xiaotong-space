# Xiaotong Space

**小童的个人数字空间 — 记录所做，分享所学。**

一个以作品展示和技术写作为核心的个人网站。把前端开发、AI 应用实践和生活片段放在同一个空间，用 Markdown 持续记录项目与思考。

基于 **Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS 4**，结合 Nuxt UI、Nuxt Content 与 Nuxt Image，支持服务端渲染和静态生成。

[快速开始](#快速开始) · [内容维护](#内容维护) · [构建与部署](#构建与部署) · [项目文档](#项目文档)

## 功能与页面

| 页面 | 路径        | 内容                                                      |
| ---- | ----------- | --------------------------------------------------------- |
| 首页 | `/`         | 交互工作台、生活照片、最新笔记、作品陈列与成长时间线      |
| 作品 | `/projects` | 「逃个周末」与「声伴 / AI Digital Human」的展示和项目手记 |
| 写作 | `/writing`  | Markdown 笔记、关键词搜索、分类筛选与分页加载             |
| 后台 | `/admin`    | 文章、首页内容、图片管理与备份（需登录）                  |
| 关于 | `/about`    | 个人介绍、技术关注与工作之外的兴趣                        |

- **内容阅读**：文章目录、代码高亮与复制、Callout、阅读时间和上一篇 / 下一篇导航。
- **主题与动效**：浅色 / 深色切换、偏好保存、环境动效暂停，以及减少动态效果设置的适配。
- **浏览体验**：响应式布局、手机导航、返回顶部、键盘焦点和跳转至主要内容。
- **SEO 与订阅**：canonical、Open Graph、结构化数据、`/sitemap.xml`、`/robots.txt` 与 `/rss.xml`。

作品预览是主题交互示意，不连接旅行规划、语音识别或模型服务。文章与首页照片、便签由集成式 Nuxt 内容后台管理，项目介绍继续使用 Git 和 Markdown。后台入口为 `/admin`，使用单管理员登录、草稿与发布版本、图片库、发布历史和备份。首次配置与部署见 [后台使用指南](docs/ADMIN.md)。

## 快速开始

需要 **Node.js 22+** 和 **pnpm 11.18.0**（版本声明见 `package.json`）。

```sh
git clone https://github.com/lekeqaq/xiaotong-space.git
cd xiaotong-space
pnpm install --frozen-lockfile
cp .env.example .env
pnpm admin:password # 配置后台管理员密码；已有配置可跳过
pnpm dev
```

开发服务默认使用 `http://localhost:3000`，端口被占用时以终端输出为准。本地开发时，将 `.env` 中的 `NUXT_PUBLIC_SITE_URL` 改为本地访问地址；正式构建前改为实际部署域名。

### 环境变量

| 变量                        | 用途                                             | 配置要求                      |
| --------------------------- | ------------------------------------------------ | ----------------------------- |
| `NUXT_PUBLIC_SITE_URL`      | canonical、Open Graph、RSS 与 sitemap 的站点地址 | 正式构建前填写完整 HTTPS 地址 |
| `NUXT_PUBLIC_GITHUB_URL`    | 页头和页脚的 GitHub 链接                         | 可选，留空隐藏入口            |
| `NUXT_PUBLIC_CONTACT_EMAIL` | 页脚的邮件链接                                   | 可选，留空隐藏入口            |

`.env.example` 提供配置模板，`.env` 不提交到 Git。`NUXT_PUBLIC_*` 会暴露给浏览器，只能填写公开信息。未设置站点地址时使用当前请求来源；不要用示例域名生成正式发布产物。

## 本地命令

| 命令             | 用途                                            |
| ---------------- | ----------------------------------------------- |
| `pnpm dev`       | 启动开发服务                                    |
| `pnpm lint`      | ESLint 检查                                     |
| `pnpm typecheck` | Nuxt / Vue / TypeScript 类型检查                |
| `pnpm format`    | 使用 Prettier 格式化项目                        |
| `pnpm build`     | 构建 Node 服务与预渲染页面                      |
| `pnpm test`      | 对生产构建执行 SSR、SEO、内容、404 和重定向测试 |
| `pnpm test:e2e`  | 对生产构建执行桌面与手机浏览器交互测试          |
| `pnpm preview`   | 预览生产构建                                    |
| `pnpm generate`  | 仅生成静态部分，不支持内容后台                  |

提交前执行：

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm test:admin
pnpm test:e2e
```

服务端测试使用本地 `3100` 端口；浏览器测试使用 `3200` 端口，结束后自动关闭服务。**必须先执行 `pnpm build`**，两套测试才能使用最新的 `.output/server/index.mjs`。

首次运行浏览器测试前执行 `pnpm exec playwright install chromium`。浏览器测试覆盖 1280px 桌面与 390px 手机布局、搜索与分类组合、键盘导航、主题持久化、数字人阶段切换及预览文字可读性。截图与失败追踪保存在忽略提交的 `artifacts/playwright/`。

已安装 Google Chrome 时，也可以运行 `PLAYWRIGHT_CHANNEL=chrome pnpm test:e2e`，使用独立的临时浏览器配置进行验收。

GitHub Actions 会在 push 和 pull request 时运行 lint、类型检查、构建以及两套测试，并保留浏览器验收产物 7 天。

## 项目结构

```text
xiaotong-space/
├── app/
│   ├── assets/css/       # 设计变量、全局与页面样式
│   ├── components/       # 布局、首页、作品、写作与内容组件
│   ├── composables/      # SEO 与滚动显现
│   ├── pages/            # 页面及内容详情路由
│   ├── types/            # 内容类型
│   └── utils/            # 导航、时间线与日期处理
├── content/
│   ├── projects/         # 项目手记
│   └── writing/          # 技术文章
├── docs/                 # 内容指南、素材来源和历史验收记录
│   └── archive/          # 不参与站点构建的早期草稿
├── public/               # 图片、favicon 和默认 OG 图
├── server/routes/        # RSS、sitemap 与 robots
├── shared/site.ts        # 站点名称与订阅标题
├── tests/site.test.mjs   # 生产构建集成测试
├── content.config.ts     # 内容集合与字段校验
└── nuxt.config.ts        # 模块、路由规则和构建配置
```

依赖、构建结果、内容缓存和本地验收产物均由 `.gitignore` 排除。

## 内容维护

### 写一篇笔记

访问 `/admin`，编辑标题、摘要、富文本正文、分类、标签、封面和发布日期。正文使用 Vditor，支持直接粘贴 Markdown 并显示格式。点击「保存草稿」手动保存，点击顶部「预览」查看完整文章；点击发布后立即更新文章、首页最新笔记、RSS 和 sitemap，无需重新构建。

现有 `content/writing/*.md` 在首次初始化时导入内容数据库，保留原有地址与正文。此后文章以后台数据库为准，修改这些 Markdown 文件不会覆盖后台内容。详情见 [后台使用指南](docs/ADMIN.md)。

首页照片和便签同样从后台编辑，支持排序、预览、保存草稿和发布。

### 维护作品和站点信息

- 项目手记放在 `content/projects/`，字段规则见 `content.config.ts`；当前支持 `travel`、`human` 两种项目预览。
- 项目摘要与展示文案统一维护在 Markdown frontmatter：`description` 用于详情与作品列表，`cardSummary` 用于首页卡片与预览，`previewCaption` 用于详情图注，`showcase` 定义展示标题、标签和收尾文案。可选的 `workbench` 指定首页工作台内容，按项目排序取首个配置项。
- 站点名称与 RSS 标题维护在 `shared/site.ts`。
- 导航与成长时间线维护在 `app/utils/site.ts`。
- 图片来源与示意素材说明见 [素材记录](docs/ASSETS.md)。

`docs/archive/` 保留早期示例草稿，不进入公开内容集合。旧 `/lab` 及其子路径、`/subscribe` 跳转至 Writing，旧个人助手项目路径跳转至 Projects；RSS 阅读器继续使用 `/rss.xml`。

## 构建与部署

腾讯云服务器与 1Panel 的域名解析、Docker 部署、HTTPS、内容迁移和维护步骤，见 [1Panel 部署指南](docs/DEPLOY-1PANEL.md)。

### Node 服务

设置正式站点地址后，在目标部署环境安装依赖并构建：

```sh
pnpm install --frozen-lockfile
pnpm build
HOST=0.0.0.0 PORT=3000 node --env-file-if-exists=.env .output/server/index.mjs
```

部署产物为 `.output/`。Nuxt Content 使用 SQLite，图片处理依赖原生模块；应在与服务器一致的操作系统和架构上构建，避免直接复制 macOS 构建到 Linux。

### 持久化内容

完整网站与后台需要 Nuxt Node 服务，纯静态托管不再支持。设置 `NUXT_ADMIN_DATA_DIR` 为持久化磁盘目录，更新代码时保留数据库与上传图片。部署前配置管理员密码哈希、实际 HTTPS 域名，并在目标系统和架构构建。

使用后台下载完整备份，恢复流程见 [后台使用指南](docs/ADMIN.md#备份与恢复)。

将代码推送至 GitHub 用于托管源码；网站上线仍需单独配置部署平台。

## 提交规范

使用 Conventional Commits，并让每次提交聚焦一个逻辑变更：

```text
feat: add a project case study
fix: correct mobile navigation
refactor: remove unused components
docs: update the writing workflow
chore: update dependencies
```

内容、代码与素材一同维护。提交前完成上述检查，避免提交 `.env`、依赖目录和构建产物。

## 项目文档

- [后台使用指南](docs/ADMIN.md)：管理员配置、文章与首页编辑、发布、部署和备份恢复。
- [Writing 内容维护指南](docs/WRITING_WORKFLOW.md)：新增、编辑与发布文章。
- [素材记录](docs/ASSETS.md)：当前使用的图片及来源。
- [产品需求](docs/PRD.md) / [技术规范](docs/TECH_SPEC.md)：初始设计与开发约束；部分早期功能已经调整，当前行为以代码和本 README 为准。
- [V1](docs/QA.md)、[V1.1](docs/QA-v1.1.md)、[V1.2](docs/QA-v1.2.md)、[V1.3](docs/QA-v1.3.md)、[V1.4](docs/QA-v1.4.md)：各阶段的验收记录。
