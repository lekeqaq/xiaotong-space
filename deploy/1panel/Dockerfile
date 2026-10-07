FROM node:22-bookworm-slim AS build

WORKDIR /app

# Bootstrap CA certificates over HTTP; APT still verifies Debian archive signatures.
RUN sed -i 's|http://deb.debian.org|http://mirrors.aliyun.com|g' /etc/apt/sources.list.d/debian.sources \
    && apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
    && sed -i 's|http://mirrors.aliyun.com|https://mirrors.aliyun.com|g' /etc/apt/sources.list.d/debian.sources \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global pnpm@11.18.0 --registry=https://registry.npmmirror.com

COPY . .

ARG NUXT_PUBLIC_SITE_URL=https://xiaotong.taozhoumo.com
ENV NUXT_PUBLIC_SITE_URL=${NUXT_PUBLIC_SITE_URL}

RUN pnpm install --frozen-lockfile --registry=https://registry.npmmirror.com && pnpm build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=node:node /app/.output ./.output
# Keep the project's dependencies for the standalone backup restoration tool.
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/scripts ./scripts

USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
