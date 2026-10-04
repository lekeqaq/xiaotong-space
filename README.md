# Xiaotong Space

小童的个人数字空间：Developer Portfolio × Technical Writing × AI Playground。

使用 Nuxt 4、Vue 3、TypeScript、Tailwind CSS 4、Nuxt UI、Nuxt Content 与 Nuxt Image。内容由 Markdown 维护，默认支持 SSR，并可预渲染为静态网站。

## 开发

需要 Node.js 22+ 和 pnpm 11。

```sh
pnpm install
pnpm dev
```

## 验证和构建

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm preview
```

`pnpm generate` 输出静态网站到 `.output/public`。不要在未设置正式站点 URL 时发布静态构建：复制 `.env.example` 为 `.env`，填写 `NUXT_PUBLIC_SITE_URL`，确保 canonical、RSS 与 sitemap 使用正式域名。

RSS 入口打开 `/subscribe` 订阅说明页，阅读器继续使用 `/rss.xml`。站点名称集中维护在 `shared/site.ts`。

## 内容维护

- `content/projects/`：项目与 Case Study
- `content/writing/`：文章，`draft: true` 不进入列表、详情、RSS 和 sitemap
- `content/lab/`：实验方向与状态
- `content.config.ts`：类型与字段校验
- `app/utils/site.ts`：导航与成长时间线
- `app/assets/css/main.css`：基础 token 与内容页面样式
- `app/assets/css/space.css`：个人工作台与共享视觉风格
- `app/assets/css/writing.css` / `projects.css`：笔记索引与作品展览
- `app/assets/css/motion.css`：入场、环境动效与主题展开过渡

当前内容是基于 PRD 的首版示例，需要替换为作者真实资料。项目详情明确标明概念方案；实验没有接入 AI 服务。当前 V1 不包含数据库服务、登录或独立 API。Nuxt Content 的内部内容索引由框架管理。

填入环境变量 `NUXT_PUBLIC_GITHUB_URL` 与 `NUXT_PUBLIC_CONTACT_EMAIL` 后，导航、页脚和联系区自动显示真实入口。未配置时显示站内联系页。

## 图片

首页采用可探索的个人工作台：照片可翻页，便签可切换，项目与文章由内容集合驱动。照片与封面素材来源见 `docs/ASSETS.md`；早期工作空间主图保留于素材目录。Projects 展览包含可切换的山野/海边场景、语音交互阶段和真实内容来源索引，均为 HTML/CSS 与轻量 Vue 状态构建。

主题首次跟随系统，按钮在浅色与深色之间直接切换并保存偏好。支持 View Transitions 的浏览器从按钮位置展开新主题，其他浏览器使用颜色淡入淡出。首页与 Projects 提供环境动效暂停按钮；所有动效遵循 `prefers-reduced-motion`。作品预览是概念交互，未接入语音或模型服务。

## 产品与技术约束

- [PRD](docs/PRD.md)
- [技术规范](docs/TECH_SPEC.md)
- [素材记录](docs/ASSETS.md)
- [验收记录](docs/QA.md)

AI 助手、语音服务与在线实验属于后续版本。发布前补充真实项目资料与联系方式，并按实际部署域名构建。
