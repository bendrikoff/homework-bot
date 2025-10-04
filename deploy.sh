#!/bin/bash

# Скрипт для развертывания Homework Bot на сервере
# Использование: ./deploy.sh

set -e

echo "🚀 Начинаем развертывание Homework Bot..."

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Устанавливаем..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

# Проверяем наличие Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Устанавливаем..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Создаем директории
echo "📁 Создаем директории..."
mkdir -p /opt/homework-bot/{temp,logs}
cd /opt/homework-bot

# Создаем .env файл если его нет
if [ ! -f .env ]; then
    echo "📝 Создаем .env файл..."
    cat > .env << EOF
BOT_TOKEN=your_bot_token_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
LOG_LEVEL=1
EOF
    echo "⚠️  Не забудьте заполнить .env файл!"
fi

# Создаем docker-compose.yml если его нет
if [ ! -f docker-compose.yml ]; then
    echo "📋 Создаем docker-compose.yml..."
    if [ -f docker-compose.prod.yml ]; then
        cp docker-compose.prod.yml docker-compose.yml
    elif [ -f docker-compose.direct.yml ]; then
        cp docker-compose.direct.yml docker-compose.yml
    else
        echo "❌ Не найден файл docker-compose.prod.yml или docker-compose.direct.yml"
        echo "📥 Скачиваем файлы из репозитория..."
        curl -fsSL https://raw.githubusercontent.com/bendrikoff/homework-bot/master/docker-compose.prod.yml -o docker-compose.prod.yml
        cp docker-compose.prod.yml docker-compose.yml
    fi
fi

# Останавливаем старый контейнер
echo "🛑 Останавливаем старый контейнер..."
docker-compose down || true

# Обновляем образ
echo "📦 Обновляем Docker образ..."

# Проверяем, используется ли GHCR
if grep -q "ghcr.io" docker-compose.yml; then
    echo "🔐 Настраиваем авторизацию для GitHub Container Registry..."
    echo "⚠️  Для GHCR нужен GitHub Token. Если ошибка авторизации, выполните:"
    echo "   echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin"
fi

docker-compose pull

# Запускаем новый контейнер
echo "▶️  Запускаем новый контейнер..."
docker-compose up -d

# Очищаем старые образы
echo "🧹 Очищаем старые образы..."
docker image prune -f

# Показываем статус
echo "📊 Статус контейнера:"
docker-compose ps

echo "✅ Развертывание завершено!"
echo "📋 Для просмотра логов: docker-compose logs -f"
echo "🔄 Для перезапуска: docker-compose restart"
echo "🛑 Для остановки: docker-compose down"
