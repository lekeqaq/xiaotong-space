# V1.2 内容与 About 调整

日期：2026-10-06。

## 内容与导航

- Projects 仅公开「逃个周末」与「AI Digital Human」。
- 周末手记依据四个本地仓库的 README、Service 与 API 集成代码整理；数字人手记依据作者提供的 LiveTalking、本地千问／DeepSeek、讯飞 ASR/TTS 方案整理。
- 未给数字人添加未经确认的延迟、流式或打断实现声明。
- AI Lab 与个人助手项目示例移入 `docs/archive/`，不进入内容集合。
- 移除导航、首页、About 与 Projects 的 AI Lab 入口，更新内容查询、sitemap 和预渲染清单。
- Nitro 中旧 `/lab` 及子路径以 301 跳转 Writing，旧个人助手项目跳转 Projects。
- About 调整为大标题、照片框与印章、三项个人关注、两个项目入口和笔记收尾；移除联系区。
- 页脚改为文字版式与四个导航，移除 RSS 图标和联系入口；Writing 的订阅功能保留。
- 补充 `WRITING_WORKFLOW.md`，说明 Markdown 编辑、草稿、图片、发布与可视化 CMS 选择。

## 验证

- `pnpm lint`、`pnpm typecheck`、`pnpm build` 全部通过。
- `pnpm test`：20 项通过，包含 SSR/SEO、文章渲染、RSS、sitemap、404 和旧链接跳转。
- `git diff --check` 通过。
- 浏览器验证 Projects 只有两个项目，两篇手记正文、目录与表格正常渲染。
- 首页 DOM 显示两个项目，AI Lab 链接数量为零。
- 1280px 桌面预览与 390px 手机预览；About 和周末手记在 390px 下页面宽度为 390px，无横向溢出。
- About 浅色与深色效果已查看；本轮查看的页面未发现浏览器 warn/error。

## 交付边界

尚未公开部署，尚未接入可视化 CMS。作品集交互示意不连接真实小程序或数字人服务。上述 301 已验证于 Nitro Node 部署；纯静态托管需按平台配置相应重定向规则。
