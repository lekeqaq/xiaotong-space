# XIAOTONG. 个人技术主页 PRD

> **2026-10-03 用户确认的 V1.1 方向**：首页改为可探索的个人工作台（替代原左右图文 Hero / 图像流结构）；Writing 使用笔记索引、搜索和直接点选的标签；Projects 使用独立交互场景的作品展览。主题默认系统、按钮直切，支持圆形展开过渡。增加轻量入场、轨道/连线、卡片浮动与滚动显现，循环动效可暂停并遵循减少动态效果偏好。以下 V1 布局约束与这些更新冲突时，以本段及用户最新要求为准。

> 版本：V1.0\
> 产品定位：Developer Portfolio × Technical Writing × AI Playground\
> 视觉基准：以用户确认的参考视觉稿为基线，但禁止直接复刻任何现有模板；保留干净、克制、现代的视觉气质，并通过内容、动效和交互建立个人辨识度。

------------------------------------------------------------------------

## 1. 产品目标

这是一个长期维护的个人技术主页，不是传统"博客模板"或在线简历。

核心目标：

1.  **建立个人技术品牌**：让访问者在 30
    秒内知道"我是谁、做什么、擅长什么、正在探索什么"。
2.  **展示真实项目能力**：通过 Case Study
    展示项目背景、技术决策、难点和结果，而不是只放项目截图。
3.  **沉淀技术内容**：持续记录前端、工程化、AI、Agent、RAG、部署等实践。
4.  **建立 AI 实验空间**：AI Lab 用于展示 AI
    Agent、RAG、语音、数字人等实验。
5.  **为后续个人 AI Assistant 留出产品入口**。
6.  **服务求职与长期职业品牌**：网站本身就是一个可演示的工程项目。

------------------------------------------------------------------------

## 2. 目标用户

### 2.1 招聘方 / 面试官

希望快速了解技术栈、工作方向、项目能力和工程思维。

### 2.2 技术同行

通过文章、项目和实验了解实现思路，形成技术交流。

### 2.3 普通访客

通过视觉、旅行/生活内容和个人介绍认识站点作者，而不是面对一份生硬的技术简历。

### 2.4 网站作者本人

低成本维护文章、项目、实验和个人状态，不依赖后台管理系统。

------------------------------------------------------------------------

## 3. 产品原则

### P0：内容优先

视觉服务于内容，不为了动画牺牲阅读和性能。

### P0：拒绝模板感

禁止首页全程使用"Hero + Bento Grid + 三列卡片 + CTA"的标准 SaaS
模板结构。

### P0：个人化

至少通过以下内容形成个人辨识度： - 项目作品 - Currently Building - Work
/ Travel / Code / Life / AI 图像流 - Journey - AI Lab - 个性化短句 -
轻量手写/注释元素 - 微交互

### P1：克制

页面保持大量留白、低饱和背景、细边框、轻阴影；强调色只用于状态、交互和重点信息。

### P1：可持续维护

文章、项目、实验均通过 Content 文件维护，不依赖 CMS 后台。

------------------------------------------------------------------------

# 4. 信息架构

``` text
/
├── Home
├── Projects
│   └── /projects/[slug]
├── Writing
│   └── /writing/[slug]
├── AI Lab
│   └── /lab/[slug]
├── About
└── 404
```

V1 暂不增加： - 登录/注册 - 评论 - 点赞 - 收藏 - 用户中心 - CMS
管理后台 - 数据库 - 复杂后端服务

------------------------------------------------------------------------

# 5. 首页

## 5.1 Header

### 内容

-   Logo：`XIAOTONG.`
-   Home
-   Projects
-   Writing
-   AI Lab
-   About
-   Theme Toggle
-   GitHub

### 行为

-   桌面端顶部轻量 Sticky。
-   页面向下滚动时允许降低高度或增加半透明背景。
-   当前路由有弱强调。
-   移动端使用简洁 Drawer/Menu。
-   不使用大型导航栏。

------------------------------------------------------------------------

## 5.2 Hero

Hero 是全站最重要区域。

### 左侧

-   Availability Badge
-   主标题
-   简介
-   CTA
-   技术栈

建议首版文案：

``` text
Hi, I'm Xiaotong.

I build things
for the web,
and explore AI.

一名前端开发者，专注于 Vue 和 TypeScript，
正在探索 AI Agent、RAG 与 AI 应用开发。
喜欢把想法变成可以使用的产品。
```

CTA： - Explore my work - About me

技术： - Vue - TypeScript - Nuxt - Python - AI / LLM

### 右侧视觉

不是普通"个人头像"。

使用： - 工作空间/城市/旅行主图 - 手写式个人短句 - Currently Building
浮层 - Shenzhen / China / 年份 - 极轻的数据轨迹/节点线条

Currently Building： - Personal AI Assistant - AI Agent Experiments -
Next Travel Plan

### 视觉约束

-   图片与卡片允许轻微越界。
-   不允许所有元素都严格落在同一矩形网格。
-   保持整体干净，不使用赛博朋克、Terminal 全屏或高饱和霓虹风。

------------------------------------------------------------------------

## 5.3 Personal Strip / Image Stream

Hero 下方增加横向内容流。

内容： - Work - Travel - Code - Life - AI

图片可以包含： - 项目局部 - 代码 - 桌面 - 相机/旅行 - 山川/城市 - AI
Demo

### 交互

-   桌面端缓慢横向自动移动。
-   Hover 暂停或轻微放大。
-   支持拖拽。
-   prefers-reduced-motion 下关闭自动移动。

目标：让网站不只是"工作简历"，而是个人数字空间。

------------------------------------------------------------------------

# 6. Selected Work

## 6.1 区域目标

展示 3-4 个真正值得讲的项目。

首版示例： 1. 逃个周末 2. AI Digital Human 3. Personal AI Assistant

## 6.2 主项目

"逃个周末"作为 Featured Project。

内容： - 项目名称 - 英文副标题 - 一句话定位 - 技术标签 - Case Study -
Live Demo（如有） - 产品设备 Mockup / Screenshot

布局允许项目视觉突破普通 Card 边界。

## 6.3 次级项目

2 个横向项目卡。

卡片包含： - 序号 - 名称 - 描述 - 技术栈 - Preview - Arrow Action

### 交互

-   Hover 图片轻微移动/缩放。
-   箭头产生位移。
-   卡片整体不做强烈 3D Tilt。
-   动画 180-350ms。

------------------------------------------------------------------------

# 7. My Journey

目的不是展示完整工作简历，而是表达技术成长方向。

示例：

``` text
2021
Frontend
Vue / TypeScript

2022
Engineering
组件库 / 性能优化 / 工程化

2023
Full-stack Exploration
Python / Docker / Backend

2024
AI Emergence
LLM / Prompt / AI Application

2025
Building
RAG / 数字人 / AI 产品

2026
Agent
构建更有趣的产品
```

### 视觉

-   一条非完全水平的 Journey Line。
-   节点之间存在自然起伏。
-   当前节点有 Accent。
-   允许轻微 Scroll Reveal。
-   不做复杂 SVG 大动画。

------------------------------------------------------------------------

# 8. Writing

## 8.1 首页

展示最新 3 篇。

字段： - Cover - Date - Title - Summary - Tags - Reading Time

## 8.2 Writing List

功能： - 全部文章 - 分类筛选 - Tag - 搜索 - 分页或 Load More

建议分类： - Frontend - Engineering - AI - Backend - DevOps - Notes

## 8.3 Article Detail

必须支持： - Markdown - 标题 - 日期 - 更新时间 - 阅读时间 - Tags - TOC -
Code Highlight - Copy Code - 图片 - Callout - 引用 - 上一篇/下一篇 -
SEO - OG - RSS

阅读页优先保证可读性，不继承首页复杂视觉。

------------------------------------------------------------------------

# 9. AI Lab

定位：

> A playground for things I'm currently exploring.

实验状态： - LIVE - BUILDING - EXPERIMENTING - PLANNING - ARCHIVED

实验字段： - EXP 编号 - 名称 - 描述 - 状态 - 技术 - Demo -
GitHub（可选） - Detail

首版： - EXP.001 Personal RAG - EXP.002 Voice Agent - EXP.003 AI Travel
Planner - EXP.004 More Ideas

AI Lab 可以比 Blog 更有实验感，但必须保持同一设计系统。

------------------------------------------------------------------------

# 10. About

内容不做传统简历表格。

结构： - Intro - What I Do - What I Use - Journey / Experience - Outside
Code - Contact

Outside Code 可以包含： - Travel - Games - Movies - Cooking

避免： - 技能百分比 - 五星熟练度 - 大量 Progress Bar

------------------------------------------------------------------------

# 11. Footer

内容： - XIAOTONG. - Frontend Developer - Based in Shenzhen -
Navigation - GitHub / Email / LinkedIn（按实际情况） - Copyright -
Designed & built by Xiaotong.

可保留一句：

``` text
Still building.
```

作为全站长期主题。

------------------------------------------------------------------------

# 12. Dark Mode

必须支持 Light / Dark / System。

要求： - 不是简单反色。 - Dark 使用深灰黑而非纯 `#000`。 -
图片亮度在暗色模式下适当控制。 - Accent 保持统一。

------------------------------------------------------------------------

# 13. 响应式

Breakpoints 以 Tailwind/Nuxt UI 体系为准。

重点： - 375px - 430px - 768px - 1024px - 1440px+ - 1920px

移动端原则： - 不机械缩小桌面布局。 - Hero 改为上下结构。 -
横向图片流支持触摸滑动。 - Timeline 变纵向。 - Project Featured
改纵向。 - TOC 转 Drawer。

------------------------------------------------------------------------

# 14. 动效规范

动效只用于： - 页面进入 - Scroll Reveal - Hover - Image Stream - Journey
节点 - Project Preview - AI 状态 - Route Transition

禁止： - 全屏 Loading 超过 600ms - 鼠标跟随光标特效常驻 -
大面积粒子背景 - 过度视差 - 所有文字逐字动画 - 影响阅读的 Smooth
Scroll - 强制自定义鼠标指针

必须兼容：

``` css
@media (prefers-reduced-motion: reduce)
```

------------------------------------------------------------------------

# 15. SEO

必须包含： - title template - meta description - canonical - OpenGraph -
Twitter Card - sitemap.xml - robots.txt - RSS - Article structured
data - Person structured data - Project 页面基础 metadata

------------------------------------------------------------------------

# 16. V1 验收标准

V1 完成条件：

-   [ ] 首页完整
-   [ ] Projects 列表与详情
-   [ ] Writing 列表与文章
-   [ ] AI Lab
-   [ ] About
-   [ ] Dark Mode
-   [ ] 响应式
-   [ ] Markdown Content
-   [ ] SEO
-   [ ] Sitemap
-   [ ] RSS
-   [ ] OG
-   [ ] 404
-   [ ] Lighthouse Performance \>= 90
-   [ ] Lighthouse Accessibility \>= 90
-   [ ] Lighthouse SEO \>= 95
-   [ ] 无明显 CLS
-   [ ] 移动端可正常使用

------------------------------------------------------------------------

# 17. V1.1 / V2

V1.1： - 全站搜索 - Command Palette - GitHub Activity - View
Transition - 更完整 Project Case Study - 图片灯箱

V2： - Ask Xiaotong AI Assistant - RAG - Blog / Projects 知识库 - AI
推荐相关内容 - AI Lab 在线 Demo - 可选 FastAPI AI Service

AI 不进入 V1 核心开发路径，避免首版被后端和模型服务拖慢。
