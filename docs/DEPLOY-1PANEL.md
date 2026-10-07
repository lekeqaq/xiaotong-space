# 小童数字空间：腾讯云 + 1Panel 部署指南

本文使用服务器 `118.89.55.56`，推荐域名 `xiaotong.taozhoumo.com`，采用 **1Panel 管理 Docker 编排、OpenResty 提供 HTTPS 和反向代理、独立目录保存内容** 的部署方式。

本文提供操作步骤和配置文件；尚未登录服务器，也未实际修改 DNS、安装服务或申请证书。面板步骤参考 1Panel 当前官方文档，不同版本的菜单名称可能略有区别。

配套镜像已在本地 Linux ARM64 容器环境验证构建、页面访问、后台登录、图片上传、重新创建容器后的数据保留，以及完整备份恢复。实际服务器架构、DNS 和 HTTPS 仍需按下文验收。

## 1. 先确定子域名

| 子域名                   | 含义                           | 建议                       |
| ------------------------ | ------------------------------ | -------------------------- |
| `xiaotong.taozhoumo.com` | 直接对应「小童的个人数字空间」 | **首选：明确、容易记住**   |
| `space.taozhoumo.com`    | 数字空间                       | 简洁，适合以后扩展个人主页 |
| `me.taozhoumo.com`       | 我的个人主页                   | 最短，但品牌辨识度较弱     |
| `blog.taozhoumo.com`     | 技术博客                       | 更适合只做文章的网站       |

下文统一使用 `xiaotong.taozhoumo.com`。这里只需新增子域名解析，不需要购买新域名，也不需要修改 `taozhoumo.com` 已有的根域名或 `www` 解析。

如果最终选择 `space.taozhoumo.com`，把下文的域名、构建参数、生产环境变量、1Panel 网站主域名和证书域名一起替换。

## 2. 部署后的结构

```text
访客访问 https://xiaotong.taozhoumo.com
              ↓ DNS A 记录
腾讯云服务器 118.89.55.56 的 80 / 443 端口
              ↓
1Panel OpenResty：HTTPS、域名匹配、反向代理
              ↓ http://127.0.0.1:3100（OpenResty 使用 host 网络时）
Docker 容器：Nuxt Node 服务，容器内端口 3000
              ↓ 挂载持久化目录
/opt/xiaotong/data/admin：数据库、上传图片
```

容器端口只映射到服务器本机 `127.0.0.1:3100`，腾讯云不用开放 3000 或 3100。前台和 `/admin` 在同一个服务中，不需要单独部署后台，也不用安装 MySQL。

服务器目录约定：

```text
/opt/xiaotong/
├── app/                       # 项目代码，包含 deploy/1panel/
├── config/
│   └── .env                   # 生产环境变量和密码哈希
├── data/
│   └── admin/
│       ├── content.sqlite     # 文章、首页、草稿、历史、媒体信息
│       └── uploads/           # 上传图片
└── backups/                   # 临时保存迁移和恢复用的完整备份
```

代码、配置、内容分别存放。重新构建镜像和更新容器会继续使用 `data/admin` 中的内容。它只是同一台服务器上的持久化目录，仍需保留异地备份。

## 3. 域名解析和腾讯云端口

### 3.1 新增 DNS A 记录

到 `taozhoumo.com` 当前使用的 DNS 服务商控制台操作。如果使用 DNSPod，进入「DNS 解析 → taozhoumo.com → 添加记录」。

| 字段     | 填写内容            |
| -------- | ------------------- |
| 主机记录 | `xiaotong`          |
| 记录类型 | `A`                 |
| 线路     | 默认                |
| 记录值   | `118.89.55.56`      |
| TTL      | 默认值，例如 600 秒 |

主机记录填 `xiaotong` 即可；以控制台最终显示 `xiaotong.taozhoumo.com` 为准。若此子域名已有 A 或 CNAME 记录，先确认用途，再调整，避免指向两个不同服务。没有正确配置 IPv6 时，不要额外添加 AAAA 记录。

在本地电脑验证：

```sh
nslookup xiaotong.taozhoumo.com
```

应解析到 `118.89.55.56`。DNS 缓存刷新有延迟，刚添加时不能解析可以稍后重试。

### 3.2 放行安全组或轻量应用服务器防火墙

普通云服务器 CVM 在「安全组 → 入站规则」设置；轻量应用服务器在实例的「防火墙」设置。服务器自身的防火墙也需要允许对应连接。

| 协议 / 端口                 | 来源        | 用途                            |
| --------------------------- | ----------- | ------------------------------- |
| TCP 80                      | `0.0.0.0/0` | HTTP、HTTP 证书验证、HTTPS 跳转 |
| TCP 443                     | `0.0.0.0/0` | HTTPS 网站                      |
| TCP SSH 实际端口，通常为 22 | 你的管理 IP | SSH 登录                        |
| TCP 1Panel 实际端口         | 你的管理 IP | 访问面板                        |

保持已有网站使用的端口和配置。3000、3100 不需要公网入站规则。

如果实例位于中国大陆，上线前确认 `taozhoumo.com` 的 ICP 备案及腾讯云接入情况；已有其他服务商的备案不一定代表可以直接在腾讯云大陆实例上使用。非中国大陆实例按所在地和服务商要求操作。

## 4. 准备 1Panel 和服务器目录

以下命令在 **118.89.55.56 的 1Panel 终端或 SSH 终端**执行，使用 root 或有 sudo 权限的账号。若是普通账号，可先运行 `sudo -i`。本地电脑执行的命令会单独标明。

### 4.1 1Panel 已安装时

直接登录现有面板。忘记访问端口或安全入口时，在服务器执行：

```sh
1pctl user-info
```

不要猜测默认面板端口，也不要重复安装已有面板。

### 4.2 1Panel 未安装时

使用 [1Panel 官方在线安装说明](https://docs.fit2cloud.com/1panel/installation/online-installation)。截至本指南编写时，官方交互式安装命令为：

```sh
bash -c "$(curl -sSL https://resource.fit2cloud.com/1panel/package/v2/quick_start.sh)"
```

按提示安装 Docker，记录面板实际端口、安全入口和管理员信息，并按上一节放行管理端口。若服务器已有其他业务，先检查当前 Docker、80 / 443 端口和现有 Web 服务，避免安装或切换 OpenResty 时影响它们。

### 4.3 安装 OpenResty，确认构建条件

在 1Panel「应用商店」安装 OpenResty；如果已安装，使用已有实例。若 80 / 443 已由其他服务占用，先确定现有站点如何由同一个代理统一管理，不要直接停止原服务。

服务器终端检查：

```sh
docker version
docker compose version
free -h
df -h /opt
```

本方案不要求在宿主机安装 Node.js 或 pnpm，构建和运行都在 Linux 容器内完成。首次 Nuxt 构建比运行时需要更多内存，建议有 4 GB 左右可用内存，并给 Docker 镜像、构建缓存和数据预留至少 10 GB 可用磁盘空间；低内存实例可在 1Panel 配置 Swap，或在相同架构的 Linux 构建环境构建镜像后导入服务器。

### 4.4 创建目录

```sh
mkdir -p /opt/xiaotong/app
mkdir -p /opt/xiaotong/config
mkdir -p /opt/xiaotong/data/admin
mkdir -p /opt/xiaotong/backups
chmod 700 /opt/xiaotong/config /opt/xiaotong/backups
chown -R 1000:1000 /opt/xiaotong/data/admin
chmod 700 /opt/xiaotong/data/admin
```

镜像以 Node 镜像中的 `node` 用户运行，UID / GID 为 `1000:1000`。持久化目录需由这个用户读写。

## 5. 将项目和部署文件放到服务器

项目随本指南提供了：

| 文件                         | 用途                                             |
| ---------------------------- | ------------------------------------------------ |
| `.dockerignore`              | 构建时排除本地密码、数据库、依赖和 Mac 构建结果  |
| `deploy/1panel/Dockerfile`   | 在 Linux 构建 Nuxt，提供生产服务及密码、恢复工具 |
| `deploy/1panel/compose.yaml` | 容器、端口、环境变量、目录挂载和重启策略         |

**这些是本次新增文件。如果还未推送至远程仓库，克隆后需通过 1Panel 文件管理上传到上述相同位置。** `.dockerignore` 必须放在项目根目录。

### 5.1 从 Git 克隆

确认服务器已安装 Git；例如 Debian / Ubuntu 可执行 `apt-get update` 和 `apt-get install -y git`，其他系统使用自己的包管理器。

首次部署、`app` 目录为空时：

```sh
git clone https://github.com/lekeqaq/xiaotong-space.git /opt/xiaotong/app
cd /opt/xiaotong/app
ls -la .dockerignore deploy/1panel/Dockerfile deploy/1panel/compose.yaml
```

若目录已经有代码，不要再次克隆覆盖；先确认现有部署内容。Git 方式要求需要上线的代码已提交并推送，未提交的本地修改不会随克隆迁移。

### 5.2 不使用 Git 时，打包本地代码上传

在 **Mac 本地终端**执行：

```sh
cd /Users/leke/project/xiaotong-space
tar --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.nuxt' \
  --exclude='.output' \
  --exclude='.data' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='.cache' \
  --exclude='artifacts' \
  --exclude='coverage' \
  -czf /tmp/xiaotong-space-code.tar.gz .
```

在 1Panel「文件」中将此压缩包上传到 `/opt/xiaotong/`，解压到 `/opt/xiaotong/app/`。解压后应直接看到 `app/package.json` 和 `app/deploy/1panel/Dockerfile`，不要多套一层 `xiaotong-space/` 目录。

代码压缩包不包含数据库和上传图片，已有内容按第 8 节单独迁移。

## 6. 构建 Linux 生产镜像

在服务器执行：

```sh
cd /opt/xiaotong/app
docker build \
  --build-arg NUXT_PUBLIC_SITE_URL=https://xiaotong.taozhoumo.com \
  -f deploy/1panel/Dockerfile \
  -t xiaotong-space:local .
```

镜像使用 Node.js 22 的 Debian 环境和项目指定的 pnpm 11.18.0，安装锁定依赖并运行 `pnpm build`。SQLite 必要时会在 Linux 编译；不要上传本地 `node_modules` 或 Mac 的 `.output` 来替代这一步。

最后看到镜像成功命名为 `xiaotong-space:local` 再继续。生产镜像同时保留恢复工具所需依赖，因此需要一定磁盘空间。

镜像构建阶段只接收公开站点地址，生产密码和内容目录不会被复制进去。

## 7. 配置生产域名和管理员密码

### 7.1 生成密码哈希

在服务器的交互式终端执行：

```sh
docker run --rm -it \
  --entrypoint node \
  xiaotong-space:local \
  /app/scripts/admin-password.mjs --print-hash
```

输入两次密码后，终端会输出一行 `scrypt:...`。复制完整这一行，不要复制提示文字。

**以当前脚本为准，密码长度要求为 8–12 个字符。** 这是现有项目的校验范围；后续修改脚本时同步调整文档。输入不回显，命令不会自动修改服务器的生产配置。

### 7.2 创建生产环境变量文件

用 1Panel 文件编辑器创建 `/opt/xiaotong/config/.env`，填写：

```dotenv
NUXT_PUBLIC_SITE_URL=https://xiaotong.taozhoumo.com
NUXT_PUBLIC_GITHUB_URL=
NUXT_PUBLIC_CONTACT_EMAIL=
NUXT_ADMIN_USERNAME=admin
NUXT_ADMIN_PASSWORD_HASH=在这里粘贴完整的scrypt哈希
```

填写真实哈希，不能保留示例文字。GitHub 链接、联系邮箱可按需填写或留空。后台地址为 `https://xiaotong.taozhoumo.com/admin`，它与前台共用域名。

设置文件权限：

```sh
chmod 600 /opt/xiaotong/config/.env
```

Compose 会把此文件中的变量注入容器，`NUXT_ADMIN_DATA_DIR=/app/data` 已由编排配置指定；`/app/data` 对应宿主机 `/opt/xiaotong/data/admin`。

不要把密码哈希写入 `NUXT_PUBLIC_*` 或提交到 Git。此 `.env` 不在代码目录中，更新代码时不用重新填写。

## 8. 把本地文章和图片一起迁移

如果需要保留本地后台编辑的内容，请在首次正式启动前完成本节。如果希望线上从项目初始内容开始，可以跳过。

### 8.1 下载、上传完整备份

1. 打开本地网站 `/admin` 并登录。
2. 在后台点击「下载完整备份」，得到 `.tar.gz` 文件。
3. 用 1Panel 文件管理上传到 `/opt/xiaotong/backups/`。
4. 为方便执行下面命令，将上传的文件命名为 `xiaotong-backup.tar.gz`。

备份包含 SQLite 一致性快照和全部上传图片，不包含 `.env`、有效登录会话、项目源码或代码内置图片。源码和内置图片已经由第 5、6 节部署。

### 8.2 停止服务后恢复

首次部署还没有创建容器时可以直接恢复。如果容器已经存在，先在 1Panel 停止 `xiaotong-space-web`，并确认它没有运行：

```sh
docker ps --filter name=xiaotong-space-web
```

表格中不应存在正在运行的该容器。再执行：

```sh
docker run --rm \
  --user 0:0 \
  --mount type=bind,source=/opt/xiaotong/backups,target=/backups,readonly \
  --mount type=bind,source=/opt/xiaotong/data,target=/data \
  --entrypoint node \
  xiaotong-space:local \
  /app/scripts/admin-restore.mjs \
  /backups/xiaotong-backup.tar.gz \
  --server-stopped \
  --data-dir /data/admin

chown -R 1000:1000 /opt/xiaotong/data/admin
chmod 700 /opt/xiaotong/data/admin
```

恢复命令挂载的是数据目录的父目录 `/opt/xiaotong/data`，工具才能安全交换新旧 `admin` 目录。看到「备份已恢复到 /data/admin」才表示成功。

原数据会保留为 `/opt/xiaotong/data/admin.before-restore-<时间戳>`。确认新内容正常后再清理旧备份目录。`--server-stopped` 只是你已经停服的声明，工具本身不会自动停止网站。

恢复时临时使用 root 写入目录，因此恢复后需要重新设置 `1000:1000` 所有权。线上登录使用第 7 节的密码。

## 9. 在 1Panel 创建 Docker 编排

### 9.1 通过面板创建

进入 **「容器 → 编排 → 创建编排」**：

| 字段     | 内容                                           |
| -------- | ---------------------------------------------- |
| 名称     | `xiaotong-space`                               |
| 创建方式 | 路径选择                                       |
| 文件路径 | `/opt/xiaotong/app/deploy/1panel/compose.yaml` |

若面板文件选择器只显示 `.yml`，切换过滤条件，或选择「编辑」方式，把 `compose.yaml` 全文粘贴进去。配置的镜像、环境文件和挂载路径均不依赖面板生成目录的位置。

部署后应出现 `xiaotong-space-web` 容器。在编排或容器详情中查看状态和日志，服务应在容器内监听 3000 端口。

### 9.2 检查服务

在服务器执行：

```sh
curl -I http://127.0.0.1:3100/
curl http://127.0.0.1:3100/api/admin/session
docker logs --tail 100 xiaotong-space-web
```

首页应返回 200，未登录的会话接口应包含 `authenticated: false` 和 `configured: true`。如果 `configured` 是 false，先检查生产环境变量文件和容器是否重新创建。

HTTP 本机检查用于确认进程和配置；正式登录、保存、发布都在最终 HTTPS 域名下进行。

### 9.3 终端启动的替代方式

如果还没有通过面板创建编排，也可以在服务器运行：

```sh
docker compose -p xiaotong-space \
  -f /opt/xiaotong/app/deploy/1panel/compose.yaml \
  up -d
```

它可能在 1Panel 编排列表中显示为 `Local` 来源；按照官方说明，此来源的编排不一定能在面板中编辑或启停。希望全程从面板管理时使用 9.1，不要另建第二套同名服务。

## 10. 创建反向代理网站

### 10.1 确认 OpenResty 网络

先在 1Panel「容器」中找到 OpenResty 实际容器名称，也可列出：

```sh
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
```

将下面占位符替换为该名称，不要原样执行：

```sh
docker inspect --format '{{.HostConfig.NetworkMode}}' OPENRESTY容器名称
```

**如果输出 `host`：** 后续代理地址使用 `http://127.0.0.1:3100`。

**如果输出其他 Docker 网络名称或 `bridge`：** 容器里的 `127.0.0.1` 指向 OpenResty 自己。将现有 OpenResty 额外接入网站网络：

```sh
docker network connect xiaotong-space-net OPENRESTY容器名称
```

随后代理地址使用 `http://xiaotong-space-web:3000`。已经连接时不用重复执行。这个额外连接不替换原网络；若日后升级或重建 OpenResty 导致连接丢失，需要重新连接，并检查其他已有网站正常。

### 10.2 创建网站

进入 **「网站 → 创建网站 → 反向代理」**：

| 字段     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| 主域名   | `xiaotong.taozhoumo.com`                                                 |
| 其他域名 | 留空                                                                     |
| 代号     | `xiaotong-space`                                                         |
| 代理地址 | 按 10.1 选择 `http://127.0.0.1:3100` 或 `http://xiaotong-space-web:3000` |
| HTTPS    | 先不启用，下一节申请证书                                                 |

这里创建的是独立的反向代理网站。不要把其他已有主站的根目录改成这个项目目录。

### 10.3 上传大小、请求头和缓存

打开此网站的配置，设置上传大小至少 **12 MB**。项目单张图片上限为 10 MB，multipart 请求还需要少量额外空间。

如果面板没有单独的上传大小选项，在该网站自己的 `server { ... }` 配置内添加或修改：

```nginx
client_max_body_size 12m;
```

确认转发到 Nuxt 的现有代理配置包含下面的请求头。如果由 1Panel 自动生成，只需核对和补充，不要重复新建 `location /` 或覆盖整份网站配置：

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_read_timeout 120s;
```

关闭该站点的反向代理缓存，避免后台、文章、首页、RSS 和 sitemap 返回旧内容。应用自身已经为上传图片设置缓存头，可由浏览器正常缓存。

保存配置时使用面板的配置检查和重载功能。应用当前不信任任意客户端转发 IP，追加这些头不会自动改变后台的登录限流策略。

## 11. 申请并开启 HTTPS

### 11.1 申请证书

在 1Panel「证书」中先创建 ACME 账户，填写可接收证书通知的邮箱，再申请证书：

| 字段      | 内容                             |
| --------- | -------------------------------- |
| 域名      | `xiaotong.taozhoumo.com`         |
| ACME 账户 | 刚创建的账户，例如 Let's Encrypt |
| 验证方式  | HTTP 验证                        |
| 自动续签  | 开启                             |

使用 HTTP 验证前确认 DNS 已指向本服务器、80 端口已放行、反向代理网站已创建，且 ACME 验证路径没有被其他规则拦截。

如果选择 DNS 验证，需要配置实际 DNS 服务商的账号；DNSPod 的 API 凭证与登录密码不是同一个东西。手动添加 TXT 的验证方式不适合无人值守自动续签。

### 11.2 将证书绑定到网站

进入 `xiaotong.taozhoumo.com` 网站配置的「HTTPS」页面：

1. 开启 HTTPS。
2. 选择刚申请的证书。
3. 将 HTTP 访问方式设置为「自动将 HTTP 跳转到 HTTPS」。
4. 保存并重载配置。

在本地浏览器打开：

- 前台：<https://xiaotong.taozhoumo.com>
- 后台：<https://xiaotong.taozhoumo.com/admin>

最终访问地址必须与 `NUXT_PUBLIC_SITE_URL` 一致。不要使用 IP、另一个子域名或 HTTP 地址操作后台，否则来源检查或 Secure Cookie 会导致登录、保存失败。

## 12. 上线验收

服务器终端检查：

```sh
curl -I https://xiaotong.taozhoumo.com/
curl -I https://xiaotong.taozhoumo.com/admin
curl -I https://xiaotong.taozhoumo.com/rss.xml
curl -I https://xiaotong.taozhoumo.com/sitemap.xml
docker inspect --format '{{.State.Health.Status}}' xiaotong-space-web
```

容器健康状态应在启动后变为 `healthy`。再从浏览器逐项确认：

- 首页、作品、写作、关于页面都能打开。
- 后台可以用生产账号登录。
- 本地迁移的文章、首页照片和图片库内容一致。
- 上传一张图片、刷新图片库后仍然存在。
- 保存和发布内容后，公开页面能显示新内容。
- 下载完整备份成功。
- 在 1Panel 重启容器后，文章、图片仍然存在。
- HTTP 自动跳到 HTTPS，证书域名正确。

不要为验证误发布实际文章；可用已有内容检查，或创建测试草稿并在测试后清理。

## 13. 后续修改密码、更新代码和备份

### 13.1 修改线上后台密码

重新执行第 7.1 节的哈希生成命令，把结果替换到 `/opt/xiaotong/config/.env` 的 `NUXT_ADMIN_PASSWORD_HASH`。

然后在 1Panel 重新部署或重新创建编排容器。**只点击「重启」不会重新读取 Compose 的 `env_file`，密码变更必须重新创建容器。** 原有登录会话会失效。

如果要通过终端操作，先确认面板创建的项目名：

```sh
docker inspect --format '{{ index .Config.Labels "com.docker.compose.project" }}' xiaotong-space-web
```

当输出为 `xiaotong-space` 且面板中的编排内容与仓库文件一致时，可以执行：

```sh
docker compose -p xiaotong-space \
  -f /opt/xiaotong/app/deploy/1panel/compose.yaml \
  up -d --force-recreate
```

如果项目名不同，使用面板管理，或在确认实际配置和项目名后再调整命令，避免创建第二套服务。

### 13.2 更新网站代码

先从后台下载完整备份并保存到服务器之外。Git 部署时，在服务器执行：

```sh
cd /opt/xiaotong/app
git status --short
git pull --ff-only
docker image tag xiaotong-space:local xiaotong-space:previous
docker build \
  --build-arg NUXT_PUBLIC_SITE_URL=https://xiaotong.taozhoumo.com \
  -f deploy/1panel/Dockerfile \
  -t xiaotong-space:local .
```

如有本地修改或 `git pull` 报错，先检查差异，不要用 `git reset --hard` 覆盖服务器配置。使用压缩包部署的项目没有 Git 元数据，应重新上传当前源代码并构建，保留独立的 `config`、`data` 和 `backups` 目录。

构建成功后，在 1Panel 使用新镜像重新创建容器；确认项目名和配置一致时，也可以使用 13.1 的 `up -d --force-recreate` 命令。仅重启旧容器不会切换到新镜像。

重新创建只有短暂停机，数据目录继续挂载。后台更新文章、首页照片、便签只需点击发布，不需要执行上述构建。

本指南的 Dockerfile 在构建阶段使用公开站点地址。如果以后更换域名，修改生产 `.env`、镜像构建参数、网站域名和证书，再重新构建、创建容器。

### 13.3 回滚代码

如果新镜像无法正常运行，而旧版本与当前数据库仍兼容，可把旧镜像重新标记并重新创建容器：

```sh
docker image tag xiaotong-space:previous xiaotong-space:local
```

然后在 1Panel 重新创建容器。镜像回滚不会回滚数据库内容；涉及数据库结构变化时，应评估兼容性，并在必要时停服、按第 8 节恢复对应备份。

### 13.4 备份和恢复

推荐定期使用后台「下载完整备份」，更新代码前也保存一份到本地电脑或其他存储。后台备份通过 SQLite 一致性快照导出，可以在运行中使用。

不要在服务运行中只复制 `content.sqlite`：SQLite 使用 WAL，未合并的写入可能在 `content.sqlite-wal` 中。手工整目录备份应先停止容器，后台完整备份则不需要停服。

1Panel 的反向代理网站备份不一定包含外部挂载的 `/opt/xiaotong/data/admin`；不能用它替代应用的完整备份。生产 `.env`、OpenResty 网站配置和证书也要按需单独保存。

恢复时停止容器，按第 8 节执行，再恢复目录权限和启动容器。现有方案只运行一个应用实例，不要改成 PM2 cluster 或多个容器共享这份 SQLite 数据。

## 14. 常见问题

| 现象                               | 优先检查                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 域名无法访问                       | A 记录、是否有错误 AAAA、腾讯云安全组、服务器防火墙、OpenResty 是否监听 80 / 443                      |
| 502 Bad Gateway                    | `curl http://127.0.0.1:3100/`、容器日志、OpenResty 网络和代理地址；桥接网络不能代理它自己的 localhost |
| 413 Request Entity Too Large       | 站点 `client_max_body_size` 至少 12m；图片本身仍不能超过 10 MB                                        |
| `configured: false`                | 生产 `.env` 是否填写哈希、容器是否重新创建                                                            |
| 保存、发布提示「请求来源无效」     | 实际 HTTPS 域名是否与 `NUXT_PUBLIC_SITE_URL` 完全一致，Host 请求头是否保留                            |
| 密码修改后仍然用旧密码             | 修改的是否为 `/opt/xiaotong/config/.env`；是否只重启了旧容器，没有重新创建                            |
| 登录反复失败后显示限流             | 当前实现连续失败 5 次会限流 15 分钟；代理后可能共享连接来源，先核对密码和账号                         |
| 图片或数据写入报权限错误           | 挂载目录是否由 `1000:1000` 所有，恢复后是否执行了 chown                                               |
| 重新部署后内容变成初始内容         | 持久化挂载路径是否变了、数据目录是否为空、是否启动了第二套服务；先停写并检查备份                      |
| 上传图片 404                       | `uploads` 是否和数据库一起迁移，挂载路径是否正确                                                      |
| 发布后前台仍显示旧内容             | 1Panel 反向代理缓存、额外 CDN 缓存是否开启；该站点关闭页面和 API 缓存                                 |
| 原生模块错误、缺少 SQLite 或 Sharp | 是否上传了 Mac 依赖或构建产物；使用本 Dockerfile 在目标 Linux 环境重新构建                            |
| `docker build` 卡在下载 Node 镜像  | 服务器能否访问镜像仓库，检查 1Panel Docker 镜像加速配置，使用可信镜像源                               |
| 构建报进程被 Killed / 内存不足     | `free -h`、Swap、构建内存；可在相同系统架构的 Linux 环境构建后导入镜像                                |
| 证书申请失败                       | DNS 是否已生效、80 端口是否畅通、ACME 验证路径是否可达；也可以改用 DNS 验证                           |

## 15. 相关文件和官方参考

- [项目后台说明](ADMIN.md)
- [项目 Dockerfile](../deploy/1panel/Dockerfile)
- [项目 Compose 配置](../deploy/1panel/compose.yaml)
- [1Panel 在线安装](https://docs.fit2cloud.com/1panel/installation/online-installation)
- [1Panel 容器编排](https://docs.fit2cloud.com/1panel/user_manual/containers/compose)
- [1Panel 创建网站](https://docs.fit2cloud.com/1panel/user_manual/websites/website-create)
- [1Panel 网站配置](https://docs.fit2cloud.com/1panel/user_manual/websites/website-config-basic)
- [1Panel 申请证书](https://docs.fit2cloud.com/1panel/user_manual/websites/certificate-create)
