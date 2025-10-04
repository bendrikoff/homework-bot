# 🚀 Развертывание без Docker Hub

Есть несколько способов развертывания без необходимости регистрации в Docker Hub:

## 🎯 **Вариант 1: GitHub Container Registry (GHCR) - Рекомендуется**

### ✅ **Преимущества:**
- Бесплатно для публичных репозиториев
- Интеграция с GitHub
- Не нужны дополнительные аккаунты
- Автоматические права доступа

### 🔧 **Настройка:**

1. **Замените в `docker-compose.prod.yml`:**
   ```yaml
   image: ghcr.io/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/homework-bot:latest
   ```
   На ваш реальный путь, например:
   ```yaml
   image: ghcr.io/alex/homework-bot/homework-bot:latest
   ```

2. **Настройте только серверные secrets:**
   - `SERVER_HOST` - IP сервера
   - `SERVER_USER` - пользователь SSH
   - `SERVER_SSH_KEY` - SSH ключ

3. **На сервере добавьте авторизацию для GHCR:**
   ```bash
   echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```

### 📋 **GitHub Secrets (только сервер):**
```
SERVER_HOST=192.168.1.100
SERVER_USER=root
SERVER_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...
```

---

## 🎯 **Вариант 2: Прямое развертывание на сервер**

### ✅ **Преимущества:**
- Полностью локально
- Не нужен никакой registry
- Быстрее (нет загрузки образов)

### 🔧 **Настройка:**

1. **Используйте workflow `deploy-direct.yml`**
2. **Замените основной deploy workflow:**
   ```bash
   mv .github/workflows/deploy.yml .github/workflows/deploy-dockerhub.yml
   mv .github/workflows/deploy-direct.yml .github/workflows/deploy.yml
   ```

3. **На сервере используйте `docker-compose.direct.yml`:**
   ```bash
   cp docker-compose.direct.yml docker-compose.yml
   ```

### 📋 **GitHub Secrets:**
```
SERVER_HOST=192.168.1.100
SERVER_USER=root
SERVER_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...
```

---

## 🎯 **Вариант 3: Без Docker вообще**

### ✅ **Преимущества:**
- Максимально просто
- Использует PM2
- Меньше ресурсов

### 🔧 **Настройка:**

1. **Используйте workflow `deploy-simple.yml`**
2. **Замените основной deploy workflow:**
   ```bash
   mv .github/workflows/deploy.yml .github/workflows/deploy-docker.yml
   mv .github/workflows/deploy-simple.yml .github/workflows/deploy.yml
   ```

3. **На сервере установите Node.js и PM2:**
   ```bash
   # Установка Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   apt-get install -y nodejs
   
   # Установка PM2
   npm install -g pm2
   ```

### 📋 **GitHub Secrets:**
```
SERVER_HOST=192.168.1.100
SERVER_USER=root
SERVER_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...
```

---

## 🚀 **Быстрый выбор:**

### **Для новичков:** Вариант 3 (без Docker)
- Проще всего настроить
- Меньше зависимостей
- Быстрее развертывание

### **Для продвинутых:** Вариант 1 (GHCR)
- Современный подход
- Лучшая изоляция
- Легче масштабировать

### **Для максимального контроля:** Вариант 2 (прямое развертывание)
- Полный контроль над процессом
- Нет зависимости от внешних сервисов

---

## 🔧 **Настройка любого варианта:**

### 1. **Подготовка сервера:**
```bash
# Создайте директорию
mkdir -p /opt/homework-bot/{temp,logs}
cd /opt/homework-bot

# Создайте .env файл
cat > .env << EOF
BOT_TOKEN=your_bot_token_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
LOG_LEVEL=1
EOF
```

### 2. **Настройка SSH ключей:**
```bash
# На локальной машине
ssh-keygen -t rsa -b 4096 -C "github-actions"
ssh-copy-id -i ~/.ssh/id_rsa.pub user@your-server
```

### 3. **Настройка GitHub Secrets:**
- `SERVER_HOST` - IP или домен сервера
- `SERVER_USER` - пользователь для SSH
- `SERVER_SSH_KEY` - приватный SSH ключ

### 4. **Проверка:**
```bash
# После push в main проверьте Actions
# Должен запуститься workflow развертывания
```

---

## 📊 **Сравнение вариантов:**

| Критерий | GHCR | Прямое | Без Docker |
|----------|------|--------|------------|
| Сложность | Средняя | Средняя | Низкая |
| Скорость | Средняя | Быстрая | Очень быстрая |
| Изоляция | Высокая | Высокая | Низкая |
| Ресурсы | Средние | Средние | Низкие |
| Масштабируемость | Высокая | Средняя | Низкая |

**Выберите подходящий вариант и следуйте инструкциям!** 🎯

---

## 🤖 **Особенности Homework Bot:**

### **Зависимости:**
- **Puppeteer** для рендеринга LaTeX и Markdown
- **Chromium** для генерации изображений
- **Временные файлы** для хранения изображений

### **Переменные окружения:**
- `BOT_TOKEN` - токен Telegram бота
- `OPENROUTER_API_KEY` - ключ API OpenRouter
- `OPENROUTER_MODEL` - модель нейросети (по умолчанию: meta-llama/llama-3.1-8b-instruct:free)
- `LOG_LEVEL` - уровень логирования (0-3, по умолчанию: 1)
- `LOG_DIR` - директория для логов

### **Директории:**
- `/app/temp` - временные файлы изображений
- `/app/logs` - файлы логов

### **Ресурсы:**
- Минимум 1GB RAM
- 500MB дискового пространства
- Подключение к интернету для API OpenRouter
