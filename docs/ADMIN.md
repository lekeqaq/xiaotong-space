# Admin Guide

English · [简体中文](ADMIN.zh-CN.md)

Use `/admin` to manage articles, homepage photos and notes, and images. Project pages are maintained in `content/projects/`.

## Sign in

Complete the [project setup](../README.md#setup), then open `/admin`. The default username is `admin`; change it with `NUXT_ADMIN_USERNAME` in `.env`.

Run `pnpm admin:password` to set an 8–12 character password. Restart the server after changing credentials. `NUXT_PUBLIC_SITE_URL` must match the address used to access the admin.

## Articles

1. Create an article and fill in its title, summary, body, category, tags, cover, URL slug, and publication date. The editor supports pasting Markdown.
2. Click **Save draft** or press Cmd/Ctrl + S. Changes are saved manually.
3. Preview the desktop and mobile layouts, then publish. Updates appear immediately without rebuilding.

Editing a published article leaves the current version online until you publish again. The URL slug is fixed after the first publication. Restore a previous version to the draft, then publish to make it live.

Unpublishing or moving an article to the recycle bin hides it from the site. Permanent deletion removes its content and history; recovery requires a backup.

## Homepage and images

Edit photos, captions, and notes, then reorder, save, preview, and publish them from the homepage editor.

Upload JPG, PNG, WebP, or AVIF images up to 10 MB each. The image library lets you search, preview, select, and copy image URLs. Built-in images and uploaded images still referenced by content or history cannot be deleted.

## Storage

Articles and homepage content are stored in `NUXT_ADMIN_DATA_DIR`, which defaults to `.data/admin`. Keep this directory on persistent storage; it contains the database and uploaded images.

`content/writing/` supplies the initial article seed. Once the database is initialized, editing these files does not update content managed through the admin.

## Backup and restore

Use **Download full backup** to export the database and uploaded images as a `.tar.gz` file. Keep backups outside the server; `.env` is not included.

Stop all Nuxt instances before restoring:

```sh
pnpm admin:restore /path/xiaotong-backup.tar.gz --server-stopped --data-dir /srv/xiaotong-data/admin
```

Set `--data-dir` to your actual content directory. The tool keeps the previous directory as `admin.before-restore-<timestamp>`. Restart the server and sign in again after restoring.
