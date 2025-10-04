# 🐳 Docker для Homework Bot

Этот документ описывает использование Docker для развертывания Homework Bot.

## 📋 Предварительные требования

- Docker 20.10+
- Docker Compose 2.0+
- Git

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-username/homework-bot.git
cd homework-bot
```

### 2. Настройка окружения
```bash
cp env.example .env
```

Отредактируйте `.env` файл:
```env
BOT_TOKEN=your_bot_token_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
LOG_LEVEL=1
LOG_DIR=/app/logs
```

### 3. Сборка и запуск
```bash
# Сборка проекта
npm run build

# Запуск с Docker Compose
docker-compose up -d

# Просмотр логов
docker-compose logs -f
```

## 📁 Структура проекта

```
homework-bot/
├── Dockerfile                 # Docker образ
├── docker-compose.yml         # Локальная разработка
├── docker-compose.prod.yml    # Продакшн с registry
├── docker-compose.direct.yml  # Прямое развертывание
├── dist/                      # Собранный код
├── temp/                      # Временные файлы (volumes)
├── logs/                      # Логи (volumes)
└── .env                       # Переменные окружения
```

## 🔧 Конфигурация

### Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|-------------|
| `BOT_TOKEN` | Токен Telegram бота | - |
| `OPENROUTER_API_KEY` | Ключ API OpenRouter | - |
| `OPENROUTER_MODEL` | Модель нейросети | `meta-llama/llama-3.1-8b-instruct:free` |
| `LOG_LEVEL` | Уровень логирования (0-3) | `1` |
| `LOG_DIR` | Директория логов | `/app/logs` |

### Volumes

- `./temp:/app/temp` - Временные файлы изображений
- `./logs:/app/logs` - Файлы логов

### Порты

- `3000` - HTTP порт (заготовка для будущего веб-интерфейса)

## 🛠️ Команды Docker

### Основные команды
```bash
# Запуск в фоне
docker-compose up -d

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Просмотр логов
docker-compose logs -f

# Статус контейнеров
docker-compose ps

# Обновление образов
docker-compose pull

# Пересборка образа
docker-compose build
```

### Отладка
```bash
# Вход в контейнер
docker-compose exec homework-bot sh

# Просмотр логов с фильтром
docker-compose logs -f | grep ERROR

# Мониторинг ресурсов
docker stats homework-bot-container
```

## 🔍 Мониторинг

### Логи
```bash
# Последние логи
docker-compose logs --tail=100

# Слежение за логами
docker-compose logs -f

# Логи ошибок
docker-compose logs | grep ERROR
```

### Статистика
```bash
# Использование ресурсов
docker stats homework-bot-container

# Информация о контейнере
docker inspect homework-bot-container
```

## 🚨 Развертывание в продакшн

### Вариант 1: GitHub Container Registry (GHCR)

1. **Обновите `docker-compose.prod.yml`:**
```yaml
image: ghcr.io/your-username/homework-bot/homework-bot:latest
```

2. **Запуск:**
```bash
cp docker-compose.prod.yml docker-compose.yml
docker-compose pull
docker-compose up -d
```

### Вариант 2: Прямое развертывание

1. **Копируйте файлы на сервер**
2. **Запуск:**
```bash
cp docker-compose.direct.yml docker-compose.yml
docker-compose build
docker-compose up -d
```

## 🔧 Приватные модели

Для использования приватных моделей OpenRouter:

```env
OPENROUTER_MODEL=openai/gpt-4-vision-preview
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## 🧹 Очистка

```bash
# Удаление неиспользуемых образов
docker image prune -f

# Удаление неиспользуемых контейнеров
docker container prune -f

# Полная очистка Docker
docker system prune -a -f
```

## ❗ Устранение неполадок

### Частые проблемы

1. **"Cannot find module"**
   - Убедитесь что команда `npm run build` выполнена
   - Проверьте что папка `dist/` существует

2. **"Permission denied"**
   - Проверьте права доступа к папкам `temp/` и `logs/`
   ```bash
   chmod 755 temp logs
   ```

3. **"Image not found"**
   - Для продакшн убедитесь что образ опубликован в registry
   - Проверьте авторизацию в registry

4. **"OpenRouter API error"**
   - Проверьте `OPENROUTER_API_KEY`
   - Убедитесь в наличии интернет-соединения

### Логи отладки

```bash
# Подробные логи Docker
docker-compose logs --details

# Логи с временными метками
docker-compose logs -t

# Логи конкретного сервиса
docker-compose logs homework-bot
```

## 📚 Дополнительные ресурсы

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
