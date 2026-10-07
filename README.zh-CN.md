# Xiaotong Space

[English](README.md) · 简体中文

小童的个人数字空间，记录项目、技术实践与生活片段。

基于 Nuxt 4、Vue 3、TypeScript、Tailwind CSS 和 Nuxt UI，支持 Markdown 项目手记、深浅主题与内置内容管理后台。

[访问网站](https://xiaotong.taozhoumo.com) · [后台指南](docs/ADMIN.zh-CN.md)

## 安装

需要 Node.js 22+ 和 pnpm 11.18.0。

```sh
git clone https://github.com/lekeqaq/xiaotong-space.git
cd xiaotong-space
pnpm install --frozen-lockfile
cp .env.example .env
```

本地开发时，将 `.env` 中的 `NUXT_PUBLIC_SITE_URL` 设为 `http://localhost:3000`，再配置后台密码：

```sh
pnpm admin:password
```

## 开发

启动开发服务，访问 `http://localhost:3000`：

```sh
pnpm dev
```

通过 `/admin` 管理文章、首页内容与图片。项目手记维护在 `content/projects/`。

## 生产构建

构建前，将 `NUXT_PUBLIC_SITE_URL` 改为正式网站地址：

```sh
pnpm build
pnpm preview
```

完整网站需要 Node 服务，并为 `NUXT_ADMIN_DATA_DIR` 配置持久化存储。

图片来源见[素材记录](docs/ASSETS.md)。
