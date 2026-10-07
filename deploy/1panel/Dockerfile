FROM node:22-bookworm-slim AS build

WORKDIR /app

# SQLite may need compilation when no prebuilt binary matches the server.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global pnpm@11.18.0

COPY . .

ARG NUXT_PUBLIC_SITE_URL=https://xiaotong.taozhoumo.com
ENV NUXT_PUBLIC_SITE_URL=${NUXT_PUBLIC_SITE_URL}

RUN pnpm install --frozen-lockfile && pnpm build

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
