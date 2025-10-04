# Используем официальный Node.js образ
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем зависимости для сборки Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

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
