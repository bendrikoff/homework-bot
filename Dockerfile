# ---------- Stage 1: Build ----------
FROM node:18-alpine AS builder
WORKDIR /app

# Чтобы Puppeteer не качал свой Chromium при установке
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Базовые инструменты для сборки нативных модулей
RUN apk add --no-cache python3 make g++ git

# Копируем конфигурационные файлы
COPY package*.json tsconfig*.json ./

# Устанавливаем все зависимости (включая dev) детерминированно
RUN npm ci

# Копируем исходники
COPY src/ ./src/

# Собираем проект
RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:18-alpine AS runtime
WORKDIR /app

# Пакеты для Chrome/Puppeteer на Alpine
RUN apk add --no-cache \
    chromium \
    nss \
    ca-certificates \
    freetype \
    harfbuzz \
    ttf-freefont \
    libstdc++

# Puppeteer будет использовать системный Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

# Сначала только манифесты — для кеша слоёв зависимостей
COPY package*.json ./

# Ставим только прод-зависимости (современный эквивалент --only=production)
RUN npm ci --omit=dev && npm cache clean --force

# Копируем собранный код из builder
# Если ты собираешь вне контейнера и уже копируешь dist в репо,
# можно заменить на: COPY dist/ ./dist/
COPY --from=builder /app/dist ./dist

# Опционально: если есть статические файлы/конфиги — добавь их копирование:
# COPY --from=builder /app/public ./public

# Создаём непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs \
    && adduser -S appuser -u 1001 \
    && chown -R appuser:nodejs /app

# Создаем директории для логов и временных файлов
RUN mkdir -p /app/logs /app/temp \
    && chown -R appuser:nodejs /app/logs /app/temp

# Переключаемся на непривилегированного пользователя
USER appuser

# Команда запуска
CMD ["npm", "start"]
