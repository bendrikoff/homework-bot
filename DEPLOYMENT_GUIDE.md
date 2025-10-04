# 🚀 Руководство по развертыванию Homework Bot

## ✅ Готовые пайплайны для развертывания

Все GitHub Actions пайплайны исправлены и готовы к использованию:

### 📁 **Доступные пайплайны:**

| Файл | Описание | Тип развертывания | Сложность |
|------|----------|-------------------|-----------|
| `deploy.yml` | **Основной** - Рекомендуется | PM2 + Node.js | 🟢 Простой |
| `deploy-direct.yml` | Прямое развертывание | Docker (локальная сборка) | 🟡 Средний |
| `deploy-simple.yml` | Альтернативный PM2 | PM2 + Node.js | 🟢 Простой |
| `deploy-ghcr.yml` | Через GitHub Container Registry | Docker (registry) | 🟠 Сложный |

---

## 🔧 Быстрая настройка (5 минут)

### Шаг 1: Настройте сервер
```bash
# SSH подключение к серверу
ssh root@your-server-ip

# Создайте директорию
mkdir -p /opt/homework-bot
cd /opt/homework-bot

# Если используете Docker пайплайны, установите Docker:
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo systemctl start docker
sudo apt-get install -y docker-compose
```

### Шаг 2: Настройте GitHub Secrets

Перейдите в **GitHub репозиторий → Settings → Secrets and variables → Actions** и добавьте:

```
SERVER_HOST     - IP вашего сервера (например: 192.168.1.100)
SERVER_USER     - SSH пользователь (root, ubuntu, deploy)
SERVER_SSH_KEY  - Приватный SSH ключ (содержимое ~/.ssh/id_rsa)
```

#### Как получить SSH ключ:

```bash
# На вашей локальной машине создайте ключ:
ssh-keygen -t rsa -b 4096 -C "github-actions-homework-bot"

# Скопируйте публичный ключ на сервер:
ssh-copy-id -i ~/.ssh/id_rsa.pub root@your-server

# Скопируйте приватный ключ для GitHub:
cat ~/.ssh/id_rsa
```

### Шаг 3: Выберите пайплайн

#### 🟢 **Для новичков - используйте `deploy.yml` (PM2)**
- ✅ Самый простой и надежный
- ✅ Автоматическая установка Node.js и PM2
- ✅ Быстрое развертывание
- ✅ Минимальные зависимости

#### 🟡 **Для продвинутых - используйте `deploy-direct.yml` (Docker)**
- ✅ Изоляция через Docker
- ✅ Автоматическая установка Docker
- ✅ Локальная сборка образов
- ⚠️ Больше ресурсов сервера

#### 🟠 **Для экспертов - используйте `deploy-ghcr.yml` (Registry)**
- ✅ Производственный подход
- ✅ Использование GitHub Container Registry
- ✅ Образы сохраняются в реестре
- ⚠️ Требует настройки прав доступа к GHCR

### Шаг 4: Запустите развертывание

```bash
# Commit и push для запуска пайплайна
git add .
git commit -m "Setup deployment pipeline"
git push origin main

# Следите за выполнением:
# GitHub → Actions → Ваш workflow
```

---

## 🔍 Проверка развертывания

### После запуска пайплайна проверьте на сервере:

#### PM2 развертывание:
```bash
ssh root@your-server
pm2 status
pm2 logs homework-bot
```

#### Docker развертывание:
```bash
ssh root@your-server
docker ps | grep homework-bot
docker-compose logs -f
```

---

## ⚙️ Настройка переменных окружения

После первого развертывания настройте `.env` файл:

```bash
# SSH на сервер
ssh root@your-server
cd /opt/homework-bot

# Отредактируйте .env файл
nano .env
```

**Пример содержимого .env:**
```env
BOT_TOKEN=1234567890:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
OPENROUTER_API_KEY=sk-or-v1-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
LOG_LEVEL=1
LOG_DIR=/app/logs
```

**После изменения .env перезапустите бота:**

#### PM2:
```bash
pm2 restart homework-bot
pm2 save
```

#### Docker:
```bash
docker-compose restart
```

---

## 🔄 Переключение между пайплайнами

Если хотите сменить тип развертывания:

```bash
# Создайте резервную копию текущего
mv .github/workflows/deploy.yml .github/workflows/deploy-backup.yml

# Переименуйте нужный пайплайн
mv .github/workflows/deploy-direct.yml .github/workflows/deploy.yml

# Commit изменения
git add .
git commit -m "Switch to Docker deployment"
git push origin main
```

---

## 🚨 Устранение проблем

### ❌ "Workflow не запускается"
1. Проверьте что файл находится в `.github/workflows/`
2. Убедитесь что все **Secrets** настроены
3. Проверьте синтаксис YAML (отступы важны!)

### ❌ "Permission denied (publickey)"
```bash
# Проверьте SSH ключ на сервере
cat ~/.ssh/authorized_keys | grep "github-actions"

# Если проблемы с правами:
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### ❌ "Архив не найден"
- Проверьте что шаг `Create deployment package` выполнился
- Убедитесь что `appleboy/scp-action` загрузил файл

### ❌ "Бот не отвечает"
1. Проверьте что `.env` файл заполнен токенами
2. Убедитесь что бот запущен:
   - PM2: `pm2 status`
   - Docker: `docker ps`
3. Проверьте логи:
   - PM2: `pm2 logs homework-bot`
   - Docker: `docker-compose logs`

---

## 🎯 Рекомендации

### 📋 **Чек-лист перед развертыванием:**
- [ ] Сервер настроен и доступен по SSH
- [ ] GitHub Secrets добавлены
- [ ] Получен токен Telegram бота от @BotFather
- [ ] Получен API ключ OpenRouter
- [ ] Выбран подходящий пайплайн

### 🏆 **Лучшие практики:**
- Используйте `deploy.yml` для начала
- Регулярно обновляйте зависимости
- Мониторьте логи: `pm2 logs homework-bot` или `docker-compose logs`
- Делайте резервные копии `.env` файла

---

## 📞 Поддержка

Если что-то не работает:
1. Проверьте логи GitHub Actions
2. Проверьте содержимое этой инструкции
3. Создайте Issue с подробным описанием ошибки

**Удачи с развертыванием! 🚀**
