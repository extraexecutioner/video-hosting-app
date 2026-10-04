FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . ./

RUN npm run build

FROM dockerhub.timeweb.cloud/oven/bun:1.2-alpine

WORKDIR /app

RUN apk add curl

COPY --from=builder /app/dist/bundle.cjs ./

COPY --from=builder /app/src/postgres-sql ./postgres-sql

EXPOSE 5000

USER bun

CMD ["bun", "bundle.cjs"]