# 后台指南

[English](ADMIN.md) · 简体中文

通过 `/admin` 管理文章、首页照片与便签、图片。项目手记仍维护在 `content/projects/`。

## 登录

完成[项目安装](../README.zh-CN.md#安装)后，访问 `/admin`。默认账号为 `admin`，可通过 `.env` 中的 `NUXT_ADMIN_USERNAME` 修改。

运行 `pnpm admin:password` 设置 8–12 位密码。修改账号或密码后重启服务。`NUXT_PUBLIC_SITE_URL` 必须与访问后台的地址一致。

## 文章

1. 新建文章，填写标题、摘要、正文、分类、标签、封面、文章地址和发布日期。编辑器支持直接粘贴 Markdown。
2. 点击「保存草稿」或按 Cmd/Ctrl + S 手动保存。
3. 预览桌面与手机布局，确认后发布。发布立即生效，无需重新构建。

编辑已发布文章时，线上保留旧版本，直到再次发布。文章地址在首次发布后固定。恢复历史版本会先替换草稿，需再次发布才会更新线上内容。

撤回发布或移入回收站会隐藏文章。永久删除会移除正文及历史版本，恢复需要备份。

## 首页与图片

在首页编辑器中修改照片、配文和便签，调整顺序后保存、预览并发布。

支持上传 JPG、PNG、WebP、AVIF，单张最大 10 MB。图片库支持搜索、预览、选择图片和复制地址。内置图片，以及仍被内容或历史版本引用的上传图片，不能删除。

## 内容存储

文章与首页内容存放在 `NUXT_ADMIN_DATA_DIR`，默认 `.data/admin`。该目录包含数据库与上传图片，需要持久化保存。

`content/writing/` 仅作为文章的首次导入来源。数据库初始化后，修改这些文件不会更新后台管理的文章。

## 备份与恢复

点击「下载完整备份」，导出包含数据库和上传图片的 `.tar.gz` 文件。建议在服务器之外保存备份；备份不包含 `.env`。

恢复前先停止所有 Nuxt 实例：

```sh
pnpm admin:restore /path/xiaotong-backup.tar.gz --server-stopped --data-dir /srv/xiaotong-data/admin
```

将 `--data-dir` 改为实际内容目录。工具会将原目录保留为 `admin.before-restore-<时间戳>`。恢复后重启服务并重新登录。
