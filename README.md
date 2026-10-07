# Xiaotong Space

English · [简体中文](README.zh-CN.md)

Xiaotong's personal space for projects, technical writing, and life beyond code.

Built with Nuxt 4, Vue 3, TypeScript, Tailwind CSS, and Nuxt UI. Includes Markdown project pages, light and dark themes, and a built-in content admin.

[Website](https://xiaotong.taozhoumo.com) · [Admin guide](docs/ADMIN.md)

## Setup

Requires Node.js 22+ and pnpm 11.18.0.

```sh
git clone https://github.com/lekeqaq/xiaotong-space.git
cd xiaotong-space
pnpm install --frozen-lockfile
cp .env.example .env
```

Set `NUXT_PUBLIC_SITE_URL` in `.env` to `http://localhost:3000` for local development, then configure the admin password:

```sh
pnpm admin:password
```

## Development

Start the development server at `http://localhost:3000`:

```sh
pnpm dev
```

Manage articles, homepage content, and images at `/admin`. Project pages live in `content/projects/`.

## Production

Set `NUXT_PUBLIC_SITE_URL` to your production URL before building:

```sh
pnpm build
pnpm preview
```

The full site requires a Node server and persistent storage for `NUXT_ADMIN_DATA_DIR`.

Image sources are listed in [ASSETS.md](docs/ASSETS.md).
