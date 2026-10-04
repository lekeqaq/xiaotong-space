# V1 验收记录

验收日期：2026-10-03。测试对象为本地生产构建，使用 Nuxt 4 / Vue 3 / TypeScript。未发布到公网。

## 页面与内容

- 首页：Hero、技术栈、图像流、主次项目、成长时间线、Writing、AI Lab、Still Building、页脚。
- Projects：列表与 3 个 Markdown Case Study。
- Writing：列表与 3 篇 Markdown 文章；关键词搜索、分类与标签筛选、空状态及清除筛选；更多文章时支持加载更多。
- 文章详情：日期、更新日期、阅读时间、标签、目录、代码高亮与复制、Callout、上一篇 / 下一篇。
- AI Lab：列表、状态筛选与 4 个实验详情。
- About：个人介绍、技术方向、经历与可配置联系入口。
- 未找到页面：真正的 HTTP 404、noindex 与恢复导航。
- 主题：Light / Dark / System；原生菜单首次点击可用，选择后关闭，偏好由 color-mode 保存。
- SEO：canonical、OpenGraph、Twitter、Person / Article JSON-LD、sitemap、RSS、robots。

共 15 个内容页面。项目、文章与实验由 Nuxt Content Collection Schema 校验。

## 自动验证

以下命令全部通过：

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

`tests/site.test.mjs` 共 23 项检查，全部通过：覆盖 15 个页面的 SSR 内容与 SEO、Markdown 代码 / Callout / 目录、RSS / sitemap、图片与 robots、4 条不存在的路径。测试启动独立生产服务器，并在结束时清理。

## 浏览器验收

在 Codex 内置 Chromium 浏览器中验证：

- 375、430、768、1024、1440、1920 px 六个宽度，首页没有页面级横向溢出。
- 移动端首页、Projects、项目详情、Writing、文章详情、AI Lab、About 没有页面级横向溢出。
- 手机导航可展开、跳转，路由切换后自动收起。
- 搜索 RAG 得到 1 篇文章；无匹配关键词显示空状态；清除筛选恢复 3 篇文章。
- Frontend 分类、标签、实验状态筛选可用。
- 文章目录链接与代码复制可用，复制后显示反馈。
- 浅色 / 深色 / 系统主题均可选择；最终首页控制台无 error / warn。

最终截图保存在 `artifacts/home-desktop.png`、`artifacts/home-mobile.png`；首屏预览保存在 `artifacts/home-preview.png`。

## Lighthouse

对 `http://127.0.0.1:3001/` 的生产构建使用 Lighthouse 13.5 默认移动端模拟与 desktop preset 分别测量。移动端测试单独执行，未与其他 Lighthouse 测试并行。

| 指标           | 移动端 | 桌面端 |
| -------------- | -----: | -----: |
| Performance    |     96 |    100 |
| Accessibility  |    100 |    100 |
| Best Practices |    100 |    100 |
| SEO            |    100 |    100 |

移动端 FCP 2.0 s、LCP 2.4 s、TBT 20 ms、CLS 0。满足 PRD 的 Performance ≥ 90、Accessibility ≥ 90、SEO ≥ 95 与无明显 CLS 的要求。

可复核报告：`artifacts/lighthouse-mobile.report.html`、`artifacts/lighthouse-desktop.report.html`，以及同名 JSON。线上结果会受到服务器、网络与部署配置影响。

## 配置与交付边界

当前项目案例、文章及个人经历是按 PRD 编写的首版示例，应替换为作者真实内容。案例页标明概念方案；AI Lab 展示实验计划与状态，未接入在线 AI 服务，符合 V1 范围。

GitHub、联系邮箱与正式域名通过 `.env.example` 中的环境变量配置。未填 GitHub 时使用站内联系入口；未填邮箱时显示明确的待配置状态。正式发布前设置真实域名并重新构建，让 canonical、RSS 和 sitemap 使用正式地址。

工作空间主视觉由内置 imagegen 生成，提示词及图片来源见 `docs/ASSETS.md`。肖像与工作空间图片不代表作者本人或真实办公室。

当前 `.output` 构建包含 macOS arm64 的 sharp 二进制；部署到不同系统或架构时，应在目标环境安装依赖并重新构建。
