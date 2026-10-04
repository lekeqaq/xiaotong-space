# XIAOTONG. 技术开发文档与 Codex 开发约束

> **2026-10-03 用户确认的 V1.1 方向**：首页改为可探索的个人工作台（替代原左右图文 Hero / 图像流结构）；Writing 使用笔记索引、搜索和直接点选的标签；Projects 使用独立交互场景的作品展览。主题默认系统、按钮直切，支持圆形展开过渡。增加轻量入场、轨道/连线、卡片浮动与滚动显现，循环动效可暂停并遵循减少动态效果偏好。以下 V1 布局约束与这些更新冲突时，以本段及用户最新要求为准。

> 版本：V1.0\
> 面向：Codex / AI Coding Agent / 人工开发\
> 原则：先完成稳定、可维护的 V1，再扩展 AI 能力。

------------------------------------------------------------------------

# 1. 技术栈

固定：

``` text
Nuxt 4
Vue 3
TypeScript
Tailwind CSS 4
Nuxt UI
Nuxt Content
@nuxt/image
@nuxtjs/color-mode（若 Nuxt UI 当前方案已覆盖则不重复安装）
Motion for Vue（仅在确有需要时）
Shiki（优先使用 Nuxt Content 内建能力）
ESLint
Prettier
pnpm
```

可选： - Pinia：只有出现跨页面复杂客户端状态时才引入。 - Zod：需要运行时
schema 校验时使用。

V1 禁止： - MySQL/PostgreSQL - Prisma - 独立 Node API - FastAPI -
登录鉴权 - CMS 后台 - 重型动画框架 - Three.js - GSAP（除非后续明确批准）

------------------------------------------------------------------------

# 2. 核心架构

``` text
Browser
   │
   ▼
Nuxt 4
├── Pages
├── Components
├── Composables
├── Nuxt Content
├── Nuxt Image
├── SEO
└── Static Assets
   │
   ▼
SSR / SSG
   │
   ▼
Vercel / Cloudflare / Node Server
```

内容：

``` text
/content
├── writing
├── projects
└── lab
```

不为静态内容创建 API。

------------------------------------------------------------------------

# 3. 推荐目录

``` text
app/
├── assets/
│   └── css/
├── components/
│   ├── common/
│   ├── home/
│   ├── project/
│   ├── writing/
│   ├── lab/
│   └── layout/
├── composables/
├── layouts/
├── pages/
│   ├── index.vue
│   ├── projects/
│   ├── writing/
│   ├── lab/
│   └── about.vue
├── plugins/
├── types/
└── utils/

content/
├── writing/
├── projects/
└── lab/

public/
├── images/
├── fonts/       # 仅项目合法可分发字体；优先系统/网络字体方案
├── icons/
├── favicon.ico
└── og/

server/
└── routes/      # V1 原则上保持最少

content.config.ts
nuxt.config.ts
app.config.ts
eslint.config.mjs
```

------------------------------------------------------------------------

# 4. Content Schema

必须使用 Nuxt Content Collection Schema，不允许页面里随意读取无类型
frontmatter。

## Writing

``` ts
{
  title: string
  description: string
  date: string
  updated?: string
  cover?: string
  tags: string[]
  category: string
  draft: boolean
  featured?: boolean
}
```

## Project

``` ts
{
  title: string
  subtitle?: string
  description: string
  year: number
  cover: string
  screenshots?: string[]
  tech: string[]
  featured: boolean
  status: 'live' | 'building' | 'archived'
  demo?: string
  repository?: string
  order?: number
}
```

## Lab

``` ts
{
  id: string
  title: string
  description: string
  status: 'live' | 'building' | 'experimenting' | 'planning' | 'archived'
  tech: string[]
  demo?: string
  repository?: string
  order?: number
}
```

------------------------------------------------------------------------

# 5. Vue / Nuxt 编码约束

## 必须

-   Composition API
-   `<script setup lang="ts">`
-   TypeScript strict
-   Props 使用 `defineProps<T>()`
-   Emits 使用 `defineEmits<T>()`
-   组件保持单一职责
-   优先 Server Rendering
-   客户端逻辑仅在必要时使用
-   使用 Nuxt 自动导入，不重复手动导入框架 API

## 禁止

-   Options API
-   `any` 滥用
-   巨型单文件组件
-   页面内堆积大量 mock 数据
-   无意义 watcher
-   用 `setTimeout` 模拟真实状态
-   在组件内直接写大量 SVG 字符串
-   复制粘贴重复组件
-   为简单状态引入 Pinia

单组件建议： - \<= 250 行 - 超过 300 行必须评估拆分 -
页面组件主要负责数据编排，视觉块拆为 section component

------------------------------------------------------------------------

# 6. CSS / Design Token

禁止页面大量 hardcode 颜色。

统一 Token：

``` css
--color-bg
--color-surface
--color-surface-muted
--color-text
--color-text-muted
--color-border
--color-accent
--color-accent-soft

--radius-sm
--radius-md
--radius-lg
--radius-xl

--shadow-soft
--shadow-card

--container
--header-height
```

优先通过 Tailwind Theme / Nuxt UI App Config 定义。

### 风格

-   Warm/Neutral White
-   Near Black
-   Soft Gray
-   Accent：低饱和 Violet / Indigo
-   状态可少量使用 Green

禁止： - 大面积纯紫 - 渐变文字泛滥 - 霓虹 - Glassmorphism 泛滥 -
所有卡片都有阴影 - 所有区域都 Bento

------------------------------------------------------------------------

# 7. Typography

原则： - 英文标题有较强 Editorial 感。 - 中文正文优先可读性。 -
不使用超过 2 套字体家族。 - 正文 `line-height >= 1.65`。 - Blog
内容宽度约 `680-760px`。 - 超大 Hero Typography 仅桌面端使用。

所有字号使用响应式设计，例如：

``` css
text-4xl md:text-6xl lg:text-7xl
```

避免大量固定 px。

------------------------------------------------------------------------

# 8. Component API

组件命名：

``` text
AppHeader
AppFooter
SectionHeading
StatusBadge
TechTag
ImageStream
FeaturedProject
ProjectCard
JourneyTimeline
WritingCard
LabCard
ContentToc
ThemeToggle
```

禁止：

``` text
Card1
Card2
HomeBlock
CommonBox
TestComponent
```

组件 props 必须表达业务语义。

------------------------------------------------------------------------

# 9. 图片

必须： - 使用 `<NuxtImg>` / `<NuxtPicture>` - 设置 width/height 或
aspect-ratio - 首屏关键图合理 preload - 非首屏 lazy load - WebP/AVIF
优先 - 避免 Layout Shift

图片分组：

``` text
/public/images/
├── home/
├── projects/
├── writing/
├── lab/
└── personal/
```

禁止把大图 base64 写入组件。

------------------------------------------------------------------------

# 10. Animation

优先 CSS Transition。

需要复杂进入动画时才使用 Motion。

标准： - Hover：150-250ms - Section Reveal：300-600ms - Route：200-350ms

Easing 保持统一。

禁止： - 无限循环大型动画 - 高频 JS mousemove 更新 DOM - Scroll listener
不节流 - 页面进入等待动画 - 动画导致 layout

`prefers-reduced-motion` 必须降级。

------------------------------------------------------------------------

# 11. SEO 实现

每个页面使用 Nuxt SEO API：

``` ts
useSeoMeta()
useHead()
```

Content Detail 根据内容动态生成： - title - description - og:title -
og:description - og:image - article metadata

统一 title：

``` text
Home:
Xiaotong - Frontend Developer & AI Explorer

Project:
{Project} - Xiaotong

Writing:
{Article} - Xiaotong
```

------------------------------------------------------------------------

# 12. Accessibility

必须： - HTML Semantic - Header/Nav/Main/Article/Aside/Footer - Button
与 Link 正确区分 - 所有交互可键盘操作 - Focus Visible - 图片 alt -
Icon-only button aria-label - 对比度满足 WCAG AA - Dialog/Drawer 管理
focus - 不使用 div 模拟 button

------------------------------------------------------------------------

# 13. Performance

目标：

``` text
Lighthouse
Performance >= 90
Accessibility >= 90
Best Practices >= 90
SEO >= 95
```

约束： - 首屏 JS 尽量小 - 不为静态展示创建 client-only component -
第三方脚本延迟加载 - 避免 npm 包只使用一个小函数 - 图片优化 - 字体优化 -
禁止首页自动播放视频作为背景

------------------------------------------------------------------------

# 14. Git 规范

分支：

``` text
main
develop（可选）
feature/*
fix/*
refactor/*
```

Commit 推荐 Conventional Commits：

``` text
feat: add hero section
feat: add project content collection
fix: correct mobile navigation
refactor: split home project section
style: refine writing card spacing
docs: update project documentation
```

一次 commit 聚焦一个逻辑变更。

------------------------------------------------------------------------

# 15. Codex 强制工作方式

Codex 在开发时必须遵守以下顺序。

## Step 1：先读文档

每次开始任务必须先读取： 1. `docs/PRD.md` 2. `docs/TECH_SPEC.md` 3.
当前相关页面/组件 4. `package.json` 5. `nuxt.config.ts`

禁止未读约束直接大规模改代码。

## Step 2：先规划

对于超过 2 个文件的改动，先输出简短 Implementation Plan： -
修改哪些文件 - 新增哪些组件 - 数据来源 - 是否影响现有功能

然后再实施。

## Step 3：小步开发

一个 Task 只完成一个明确目标。

错误示例： \> "把整个首页、博客、AI Lab、SEO 一次做完。"

正确： \> "实现 Header + Hero。" \> "实现 Image Stream。" \> "实现
Project Collection + Selected Work。"

## Step 4：验证

每个任务结束必须执行适用的：

``` bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

如果项目没有 test，不允许为了形式凭空生成无价值测试。

## Step 5：汇报

完成后必须说明： - 修改文件 - 实现内容 - 验证结果 - 遗留问题

------------------------------------------------------------------------

# 16. Codex 禁止事项

未经明确要求，Codex 不得：

1.  擅自替换技术栈。
2.  从 Nuxt 改 Next.js。
3.  引入数据库。
4.  引入认证。
5.  引入新的 UI Framework。
6.  大规模重构无关代码。
7.  删除现有功能来解决错误。
8.  用 `any` 绕过 TS。
9.  用 `@ts-ignore` 直接压错误。
10. 关闭 ESLint Rule 来解决单个问题。
11. 使用假接口冒充完成。
12. 使用 Lorem Ipsum 作为最终内容。
13. 擅自改变视觉主题。
14. 为追求炫酷加入重型动画。
15. 一次安装大量依赖。
16. 复制现有网站源码或组件。
17. 将 Secret/API Key 写入代码。
18. 将 `.env` 提交 Git。
19. 为静态内容创建不必要的 API。
20. 在没有验证 build 的情况下宣称任务完成。

------------------------------------------------------------------------

# 17. 视觉实现约束

参考图是**设计方向**，不是要求像素级复刻。

必须保留： - 大量留白 - 左文右图 Hero - 低饱和中性色 - 项目主次层级 -
Journey - Writing - AI Lab - Personal Image Stream - 轻量手写/注释感

必须创新： - 图片素材 - 文案 - 项目构图 - 微交互 - Section 转场 -
个人状态 - 项目 Case Study - AI Lab 表达

禁止直接复制： - Nuxt Portfolio Template 的完整 DOM - 原模板 CSS -
原模板文案 - 原模板页面排列的逐像素实现

------------------------------------------------------------------------

# 18. 开发阶段

## Phase 0 - Foundation

-   Nuxt 4
-   TS
-   Tailwind
-   Nuxt UI
-   Nuxt Content
-   ESLint
-   Design Tokens
-   Global Layout

## Phase 1 - Home Shell

-   Header
-   Hero
-   Image Stream
-   Footer

## Phase 2 - Projects

-   Content Schema
-   Featured Project
-   Project Cards
-   Projects List
-   Project Detail

## Phase 3 - Journey

-   Timeline
-   Responsive

## Phase 4 - Writing

-   Content Schema
-   Writing List
-   Article Detail
-   TOC
-   Code
-   Search/Filter（可按范围延后）

## Phase 5 - AI Lab

-   Collection
-   Cards
-   Lab Detail

## Phase 6 - About

-   Personal Intro
-   Tech
-   Journey
-   Outside Code

## Phase 7 - Polish

-   Dark Mode
-   Motion
-   Responsive
-   A11y
-   SEO
-   OG
-   Sitemap
-   RSS
-   404

## Phase 8 - QA

-   Lint
-   Typecheck
-   Build
-   Lighthouse
-   Mobile QA
-   Browser QA

------------------------------------------------------------------------

# 19. Codex 首批任务建议

不要让 Codex 直接"开发整个网站"。

依次下发：

### Task 01

初始化项目、依赖、目录、Design Token、基础 Layout。

### Task 02

实现 Header + Hero，严格按照 PRD，不实现其他 Section。

### Task 03

实现 Personal Image Stream。

### Task 04

创建 Project Content Collection，加入 3 个示例项目。

### Task 05

实现 Selected Work。

### Task 06

实现 Journey。

### Task 07

实现 Writing Collection 与首页 Writing。

### Task 08

实现 Article Detail。

### Task 09

实现 AI Lab。

### Task 10

实现 About + Footer。

### Task 11

Dark Mode + Responsive + Motion。

### Task 12

SEO + Sitemap + RSS + OG + 404。

### Task 13

最终 QA 和性能优化。

------------------------------------------------------------------------

# 20. Definition of Done

一个任务只有同时满足以下条件才算完成：

-   功能符合 PRD
-   UI 符合 Design Token
-   Desktop 正常
-   Mobile 正常
-   Dark Mode 正常（适用时）
-   无 TS Error
-   无 ESLint Error
-   Build 成功
-   无明显 Console Error
-   无明显 CLS
-   Keyboard 可操作
-   未引入无必要依赖
-   未破坏其他页面
