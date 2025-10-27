# ---------- Runtime only (uses prebuilt dist) ----------
FROM node:18-alpine

WORKDIR /app

# Если используешь рендеринг/скриншоты (Puppeteer, Playwright и т.п.) — оставь блок ниже.
# Если не нужно — можешь закомментировать apk add и переменные PUPPETEER_*.
RUN apk add --no-cache \
    chromium \
    nss \
    ca-certificates \
    freetype \
    harfbuzz \
    ttf-freefont \
    libstdc++

ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    LOG_DIR=/app/logs

# Копируем только манифесты — слой с зависимостями хорошо кешируется
COPY package*.json ./

# Ставим только прод-зависимости
RUN npm ci --omit=dev && npm cache clean --force

# Копируем собранный код и нужные файлы
COPY dist ./dist
COPY ecosystem.config.js ./ecosystem.config.js

# Подготовка директорий и непривилегированный пользователь
RUN addgroup -g 1001 -S nodejs \
 && adduser -S appuser -u 1001 \
 && mkdir -p /app/logs /app/temp \
 && chown -R appuser:nodejs /app

USER appuser

# Если в package.json есть "start": "node dist/index.js" — оставляем так
CMD ["npm", "start"]
