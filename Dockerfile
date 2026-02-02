# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

RUN apk update && apk upgrade --no-cache

COPY package.json package-lock.json* yarn.lock* ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:24-alpine AS runner

WORKDIR /app

RUN apk update && apk upgrade --no-cache

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/next-i18next.config.* ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]