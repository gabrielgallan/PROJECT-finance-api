FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

FROM deps AS build

COPY prisma ./prisma
RUN pnpm prisma generate

COPY tsconfig*.json nest-cli.json ./
COPY src ./src

RUN pnpm build

FROM base AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json pnpm-lock.yaml ./

EXPOSE 8001

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/infra/main.js"]
