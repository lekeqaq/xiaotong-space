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
| 关于 | `/about`    | 个人介绍、技术关注与工作之外的兴趣                        |

- **内容阅读**：文章目录、代码高亮与复制、Callout、阅读时间和上一篇 / 下一篇导航。
- **主题与动效**：浅色 / 深色切换、偏好保存、环境动效暂停，以及减少动态效果设置的适配。
- **浏览体验**：响应式布局、手机导航、返回顶部、键盘焦点和跳转至主要内容。
- **SEO 与订阅**：canonical、Open Graph、结构化数据、`/sitemap.xml`、`/robots.txt` 与 `/rss.xml`。

作品预览是主题交互示意，不连接旅行规划、语音识别或模型服务。站点内容通过 Git 和 Markdown 管理，目前未接入登录或可视化 CMS。

## 快速开始

需要 **Node.js 22+** 和 **pnpm 11.18.0**（版本声明见 `package.json`）。

```sh
git clone https://github.com/lekeqaq/xiaotong-space.git
cd xiaotong-space
pnpm install --frozen-lockfile
cp .env.example .env
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
| `pnpm preview`   | 预览生产构建                                    |
| `pnpm generate`  | 生成静态站点                                    |

提交前执行：

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

测试会启动独立服务，使用本地 `3100` 端口，结束后自动关闭。**必须先执行 `pnpm build`**，测试才能使用最新的 `.output/server/index.mjs`。

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

在 `content/writing/` 新建 Markdown 文件，例如 `my-first-note.md`：

```markdown
---
title: '我的第一篇实践笔记'
description: '记录一个实际问题的解决过程。'
date: '2026-10-06'
cover: '/images/personal/notebook.jpg'
tags: ['Vue', '实践']
category: 'Engineering'
draft: true
readingTime: 3
---

## 从一个问题开始

在这里写下思路、实现和复盘。
```

文件名决定文章地址，例如 `/writing/my-first-note`。`draft: true` 的文章不进入列表、详情、RSS 或 sitemap；准备发布时改为 `false`。阅读时间由 `readingTime` 手动填写，正文从二级标题开始，图片放入 `public/images/` 并用 `/images/...` 引用。

保存文件后可在开发服务中查看；线上内容需要重新构建和发布。完整字段说明与编辑流程见 [Writing 内容维护指南](docs/WRITING_WORKFLOW.md)。

### 维护作品和站点信息

- 项目手记放在 `content/projects/`，字段规则见 `content.config.ts`；当前支持 `travel`、`human` 两种项目预览。
- 站点名称与 RSS 标题维护在 `shared/site.ts`。
- 导航与成长时间线维护在 `app/utils/site.ts`。
- 图片来源与示意素材说明见 [素材记录](docs/ASSETS.md)。

`docs/archive/` 保留早期示例草稿，不进入公开内容集合。旧 `/lab` 及其子路径、`/subscribe` 跳转至 Writing，旧个人助手项目路径跳转至 Projects；RSS 阅读器继续使用 `/rss.xml`。

## 构建与部署

### Node 服务

设置正式站点地址后，在目标部署环境安装依赖并构建：

```sh
pnpm install --frozen-lockfile
pnpm build
HOST=0.0.0.0 PORT=3000 node .output/server/index.mjs
```

部署产物为 `.output/`。Nuxt Content 使用 SQLite，图片处理依赖原生模块；应在与服务器一致的操作系统和架构上构建，避免直接复制 macOS 构建到 Linux。

### 静态托管

```sh
pnpm generate
```

将 `.output/public/` 部署到支持静态文件的托管平台。静态产物的 SEO 与订阅地址在构建时生成，修改域名后需要重新生成。纯静态托管还需按平台配置旧路径重定向；Nitro 的 301 规则已由 Node 部署测试覆盖。

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

- [Writing 内容维护指南](docs/WRITING_WORKFLOW.md)：新增、编辑与发布文章。
- [素材记录](docs/ASSETS.md)：当前使用的图片及来源。
- [产品需求](docs/PRD.md) / [技术规范](docs/TECH_SPEC.md)：初始设计与开发约束；部分早期功能已经调整，当前行为以代码和本 README 为准。
- [V1](docs/QA.md)、[V1.1](docs/QA-v1.1.md)、[V1.2](docs/QA-v1.2.md)、[V1.3](docs/QA-v1.3.md)：各阶段的历史验收记录。
