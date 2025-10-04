# 🚀 Простое развертывание Homework Bot

## ✅ Готово!

Используется **проверенный пайплайн из feedback-bot** - просто работает!

## 🔧 Требуется только:

### GitHub Secrets:
```
SERVER_HOST     - IP вашего сервера
SERVER_USER     - SSH пользователь (обычно root)  
SERVER_PASSWORD - Пароль сервера
```

## 📋 Быстрая настройка:

1. **Добавьте secrets в GitHub:**
   - GitHub → Settings → Secrets and variables → Actions
   - Добавьте SERVER_HOST, SERVER_USER, SERVER_PASSWORD

2<｜tool▁sep｜>

2. **Настройте сервер (один раз):**
   ```bash
   # SSH на сервер
   ssh root@your-server
   
   # Включить вход по паролю (если отключен)
   sudo nano /etc/ssh/sshd_config
   # Найти и установить: PasswordAuthentication yes
   sudo systemctl restart sshd
   ```

3. **Запустите развертывание:**
   ```bash
   git add .
   git commit -m "Setup deployment" 
   git push origin main
   ```

## 🎯 Что происходит автоматически:

- ✅ Сборка проекта (`npm run build`)
- ✅ Создание артефактов с нужными файлами
- ✅ Загрузка на сервер `/opt/homework-bot/`
- ✅ Автоматическая установка Docker (если нужно)
- ✅ Сборка и запуск Docker контейнера
- ✅ Сохранение .env файла (не перезаписывается)

## 🔍 После развертывания:

1. **SSH на сервер** и настройте токены:
   ```bash
   ssh root@your-server
   cd /opt/homework-bot
   nano .env
   # Заполните BOT_TOKEN и OPENROUTER_API_KEY
   ```

2. **Перезапустите бота:**
   ```bash
   docker-compose restart
   ```

3. **Проверьте статус:**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

## 🎉 Всё!

Используется тот же проверенный пайплайн что и в feedback-bot, только адаптированный для homework-bot с другими переменными окружения и сетью.

**Никаких лишних файлов, никаких сложных настроек - просто работает!** 🚀
