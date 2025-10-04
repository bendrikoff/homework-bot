# 🔐 GitHub Secrets для автоматического развертывания

Этот документ описывает настройку GitHub Secrets для автоматического развертывания Homework Bot.

## 📋 Необходимые Secrets

### Для всех вариантов развертывания:

| Secret | Описание | Пример |
|--------|----------|--------|
| `SERVER_HOST` | IP адрес или домен сервера | `192.168.1.100` или `bot.example.com` |
| `SERVER_USER` | SSH пользователь | `root` или `ubuntu` |
| `SERVER_SSH_KEY` | Приватный SSH ключ | См. раздел "Генерация SSH ключа" |

### Дополнительные (опционально):

| Secret | Описание | Когда нужен |
|--------|----------|-------------|
| `GITHUB_TOKEN` | Токен GitHub | Для авторизации в GHCR |
| `DOCKER_USERNAME` | Имя пользователя Docker Hub | При использовании Docker Hub |
| `DOCKER_PASSWORD` | Пароль Docker Hub | При использовании Docker Hub |

## 🔑 Генерация SSH ключа

### 1. Создание SSH ключа

```bash
# Генерируем новый SSH ключ
ssh-keygen -t rsa -b 4096 -C "github-actions-homework-bot"

# Или с конкретным именем файла
ssh-keygen -t rsa -b 4096 -f ~/.ssh/homework-bot_deploy_key -C "github-actions-homework-bot"
```

### 2. Сохранение приватного ключа

Посмотрите содержимое приватного ключа:

```bash
cat ~/.ssh/id_rsa
# или
cat ~/.ssh/homework-bot_deploy_key
```

**Важно:** Скопируйте весь ключ включая `-----BEGIN OPENSSH PRIVATE KEY-----` и `-----END OPENSSH PRIVATE KEY-----`

### 3. Копирование публичного ключа на сервер

```bash
# Копируем публичный ключ на сервер
ssh-copy-id -i ~/.ssh/id_rsa.pub root@your-server-ip

# Или если используете файл с конкретным имеем
ssh-copy-id -i ~/.ssh/homework-bot_deploy_key.pub root@your-server-ip
```

## ⚙️ Настройка GitHub Secrets

### Через веб-интерфейс:

1. Перейдите в репозиторий GitHub
2. Выберите `Settings` → `Secrets and variables` → `Actions`
3. Нажмите `New repository secret`
4. Добавьте каждый secret:

```
Name: SERVER_HOST
Secret: 192.168.1.100

Name: SERVER_USER
Secret: root

Name: SERVER_SSH_KEY
Secret: -----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAA...
...полный ключ...
-----END OPENSSH PRIVATE KEY-----
```

### Через GitHub CLI:

```bash
# Установите GitHub CLI если не установлен
gh secret set SERVER_HOST --body "192.168.1.100"
gh secret set SERVER_USER --body "root"
gh secret set SERVER_SSH_KEY --body "$(cat ~/.ssh/id_rsa)"
```

## 🖥️ Подготовка сервера

### 1. Создание директории

```bash
# SSH подключение к серверу
ssh root@your-server-ip

# Создаем директорию проекта
mkdir -p /opt/homework-bot/{temp,logs}
cd /opt/homework-bot

# Создаем .env файл
cat > .env << EOF
BOT_TOKEN=your_bot_token_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
LOG_LEVEL=1
EOF
```

### 2. Настройка прав доступа

```bash
# Устанавливаем права на директории
chmod 755 /opt/homework-bot
chmod 755 /opt/homework-bot/temp
chmod 755 /opt/homework-bot/logs

# Создаем символическую ссылку для удобства
ln -sf /opt/homework-bot /home/homework-bot
```

### 3. Тестирование SSH подключения

```bash
# С локальной машины тестируем подключение
ssh -i ~/.ssh/id_rsa root@your-server-ip "echo 'SSH connection successful'"

# Проверяем что можем создавать файлы
ssh -i ~/.ssh/id_rsa root@your-server-ip "touch /opt/homework-bot/test && rm /opt/homework-bot/test"
```

## 🔧 Настройка для разных систем

### Ubuntu/Debian
```bash
# Установка необходимых пакетов
apt-get update
apt-get install -y docker.io docker-compose git

# Запуск Docker
systemctl enable docker
systemctl start docker

# Добавление пользователя в группу docker
usermod -aG docker $USER
```

### CentOS/RHEL
```bash
# Установка Docker
yum install -y docker docker-compose git
systemctl enable docker
systemctl start docker
```

### Alpine Linux
```bash
# Установка Docker
apk add docker docker-compose git bash
rc-update add docker boot
service docker start
```

## 🚀 Проверка развертывания

### 1. Запуск workflow

После настройки secrets сделайте push в ветку `main`:

```bash
git add .
git commit -m "Setup deployment"
git push origin main
```

### 2. Мониторинг

- Перейдите в `Actions` в репозитории GitHub
- Найдите запущенный workflow `🚀 Деплой Homework Bot`
- Следите за прогрессом выполнения

### 3. Проверка на сервере

```bash
# SSH подключение к серверу
ssh root@your-server-ip

# Проверяем что контейнер запущен
docker ps | grep homework-bot

# Просмотр логов
docker-compose -f /opt/homework-bot/docker-compose.yml logs -f
```

## 🛡️ Безопасность

### SSH ключи
- Никогда не коммитьте приватные ключи в репозиторий
- Используйте отдельные ключи для каждого проекта
- Регулярно ротируйте ключи

### Серверная безопасность

```bash
# Настройка файрвола (Ubuntu/Debian)
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable

# Отключение root login (рекомендуется)
echo "PermitRootLogin no" >> /etc/ssh/sshd_config
systemctl restart ssh

# Настройка автоматических обновлений
apt-get install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### Переменные окружения

```bash
# Создаем отдельного пользователя для бота
useradd -m -s /bin/bash homework-bot-user
usermod -aG docker homework-bot-user

# Настраиваем права на директорию
chown -R homework-bot-user:homework-bot-user /opt/homework-bot
```

## ❗ Устранение неполадок

### "Permission denied (publickey)"

1. Проверьте что публичный ключ добавлен на сервер:
```bash
cat ~/.ssh/authorized_keys | grep "github-actions"
```

2. Проверьте права доступа к ключу:
```bash
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### "Host key verification failed"

```bash
# Добавьте сервер в known_hosts
ssh-keyscan your-server-ip >> ~/.ssh/known_hosts
```

### "Docker daemon not running"

```bash
# На сервере
systemctl start docker
systemctl enable docker
```

### Workflow не запускается

1. Проверьте что workflow файлы находятся в `.github/workflows/`
2. Убедитесь что все необходимые secrets настроены
3. Проверьте синтаксис YAML файлов

## 📚 Дополнительные ресурсы

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [SSH Key Generation](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
- [Docker Installation](https://docs.docker.com/engine/install/)
