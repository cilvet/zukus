FROM oven/bun:1.3.3

WORKDIR /app

COPY package.json bun.lock tsconfig.json ./
COPY apps/server/package.json apps/server/tsconfig.json ./apps/server/
COPY apps/server/src ./apps/server/src

RUN bun install

WORKDIR /app/apps/server

EXPOSE 4848

CMD ["bun", "src/index.ts"]
