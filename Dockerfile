# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# 1. Базовые пакеты и Chrome
RUN apk add --no-cache \
    nodejs \
    npm \
    python3 \
    build-base \
    chromium \
    nss \
    ca-certificates

# 2. Минимальный набор для рендеринга
RUN apk add --no-cache \
    freetype \
    freetype-dev \
    harfbuzz \
    ttf-freefont \
    libstdc++

# 3. Добавляем edge репозиторий и устанавливаем LLVM15
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories && \
    apk add --no-cache llvm15-libs@edge && \
    rm -rf /var/cache/apk/*

# Настраиваем Puppeteer для использования установленного Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем собранное приложение
COPY dist/ ./dist/

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S homework-bot-user -u 1001

# Создаем директории для временных файлов и логов
RUN mkdir -p /app/temp /app/logs

# Переключаемся на непривилегированного пользователя
USER homework-bot-user

# Убеждаемся что пользователь может создавать файлы
RUN touch /app/temp/.test && rm /app/temp/.test || true

# Открываем порт (если понадобится в будущем)
EXPOSE 3000

# Команда запуска
CMD ["node", "dist/index.js"]
