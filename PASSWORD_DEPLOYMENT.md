# 🔑 Развертывание с входом по паролю

## ✅ Обновлено!

Пайплайн `deploy.yml` теперь использует **вход по паролю** вместо SSH ключей. Это значительно упрощает настройку.

## 🔧 Требуемые Github Secrets

Вместо SSH ключа теперь нужен только пароль:

```env
SERVER_HOST     - IP адрес сервера (например: 192.168.1.100)
SERVER_USER     - SSH пользователь (например: root)
SERVER_PASSWORD - Пароль для входа на сервер  
SERVER_PORT     - SSH порт (опционально, по умолчанию: 22)
```

## 📋 Быстрая настройка

### 1. Настройка сервера (один раз)

```bash
# SSH на ваш сервер
ssh root@your-server

# Разрешить вход по паролю (если отключен)
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Перезапустить SSH
systemctl restart sshd

# Убедиться что файрволл разрешает SSH
ufw allow ssh
ufw allow 22
```

### 2. Получение информации о сервере

```bash
# Узнать IP сервера
curl -s ifconfig.me
# или
ip addr show

# Проверить SSH порт (обычно 22)
ss -tlnp | grep ssh

# Установить пароль для root (если не установлен)
passwd root
```

### 3. Настройка GitHub Secrets

Перейдите в **GitHub репозиторий → Settings → Secrets and variables → Actions**

Добавьте следующие secrets:

```
SERVER_HOST     = your-server-ip-address
SERVER_USER     = root
SERVER_PASSWORD = your-root-password  
SERVER_PORT     = 22  (если не стандартный)
```

## 🔒 Безопасность

### Рекомендации по защите паролей:

1. **Используйте сложные пароли:**
   ```bash
   # Генерация сложного пароля
   openssl rand -base64 32
   ```

2. **Ограничьте доступ по SSH:**
   ```bash
   # Редактировать /etc/ssh/sshd_config
   sed -i 's/#AllowUsers.*/AllowUsers root/' /etc/ssh/sshd_config
   ```

3. **Настройте fail2ban:**
   ```bash
   apt-get install fail2ban
   systemctl enable fail2ban
   systemctl start fail2ban
   ```

## 🚀 Примеры настройки

### Для VPS провайдера (DigitalOcean, Vultr, etc.):

```env
SERVER_HOST     = 164.92.xxx.xxx
SERVER_USER     = root  
SERVER_PASSWORD = your-vps-root-password
SERVER_PORT     = 22
```

### Для локального сервера:

```env
SERVER_HOST     = 192.168.1.100
SERVER_USER     = deployuser
SERVER_PASSWORD = your-secure-password
SERVER_PORT     = 2222  (если нестандартный)
```

### Для VPS с не-root пользователем:

```env
SERVER_HOST     = your-server.com
SERVER_USER     = ubuntu
SERVER_PASSWORD = your-user-password
SERVER_PORT     = 22
```

**Примечание:** Для пользователя отличного от `root` нужно добавить права sudo или создать home директорию:

```bash
# Если используете ubuntu пользователя
sudo mkdir -p /opt/homework-bot
sudo chown ubuntu:ubuntu /opt/homework-bot
```

## 🔍 Проверка конфигурации

### Локальная проверка:

```bash
# Проверить доступ к серверу
ssh root@your-server-ip "echo 'SSH доступ работает'"

# Проверить работу пайплайна
# Сделать commit в main ветку и следить в GitHub Actions
```

### После развертывания:

```bash
# SSH на сервер для проверки
ssh root@your-server-ip

# Проверить Docker контейнер
docker ps | grep homework-bot

# Проверить статус
docker-compose -f /opt/homework-bot/docker-compose.yml ps

# Проверить логи
docker-compose -f /opt/homework-bot/docker-compose.yml logs -f
```

## ⚡ Альтернативы

### Если пароль не работает, используйте SSH ключи:

Перейдите к пайплайну `deploy-pm2.yml` (использует SSH ключи):

```bash
# Переименуйте пайплайны через командную строку или GitHub:
# deploy.yml → deploy-password.yml
# deploy-pm2.yml → deploy.yml
```

### Если нужен PM2 вместо Docker:

```bash
# Переключитесь на пайплайн без Docker:
# deploy.yml → deploy-docker.yml  
# deploy-simple-backup.yml → deploy.yml
```

## 📞 Поддержка

**Частые проблемы:**

❌ **"Permission denied (password)"**
- Проверьте что SSH разрешает вход по паролю
- Убедитесь что пароль правильный
- Проверьте что файрволл не блокирует SSH

❌ **"Connection refused"**  
- Проверьте IP адрес сервера
- Проверьте SSH порт (по умолчанию 22)
- Убедитесь что SSH служба запущена

❌ **"Host key verification failed"**
```bash
ssh-keygen -R your-server-ip
```

## ✅ Проверочный чек-лист

- [ ] Сервер доступен по SSH с паролем
- [ ] GitHub Secrets настроены (HOST, USER, PASSWORD, PORT)
- [ ] SSH служба запущена на сервере  
- [ ] Файрволл разрешает SSH соединения
- [ ] Пароль сервера известен и сложный
- [ ] Директория `/opt/homework-bot` доступна для записи

**Готово к развертыванию! 🚀**
