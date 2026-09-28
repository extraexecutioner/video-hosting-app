FROM dh-mirror.gitverse.ru/library/node:22.11.0-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . ./

RUN npm run build

FROM dh-mirror.gitverse.ru/nginx:1.27-alpine-slim

WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80