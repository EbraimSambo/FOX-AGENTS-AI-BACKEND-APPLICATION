FROM node:22-alpine

WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm install

RUN pnpm drizzle-kit migrate

EXPOSE 3005
