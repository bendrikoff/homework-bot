# 🔧 Исправление ошибки GHCR права доступа

## 🚨 Проблема
```
denied: installation not allowed to Create organization package
```

Эта ошибка возникает когда GitHub Actions пытается создать Docker пакет в GitHub Container Registry, но у него нет необходимых прав.

## ✅ Решения

### 🎯 **Решение 1: Docker без GHCR (АКТИВНО)**

Изменили основной пайплайн на `deploy-direct.yml`, который:
- ✅ Собирает Docker образ прямо на сервере
- ✅ Не использует GitHub Container Registry
- ✅ Полностью автоматический
- ✅ Не требует дополнительных настроек

**Текущий активный пайплайн: `deploy.yml` → Docker Direct**

### 🔧 **Решение 2: PM2 развертывание (Запасное)**

Если Docker не работает, используйте простой пайплайн:

```bash
# Переключиться на PM2 развертывание
mv .github/workflows deployment .github/workflows/deploy-docker.yml
mv .github/workflows/deploy-simple-backup.yml .github/workflows/deploy.yml
```

Или переименуйте файлы:
- `deploy-simple-backup.yml` → `deploy.yml`
- Старый `deploy.yml` → `deploy-docker.yml`

### 🔐 **Решение 3: Настройка GHCR прав (Для опытных)**

Если все-таки хотите использовать GHCR:

1. **Настройте права репозитория:**
   ```
   GitHub → Settings → Actions → General
   ```
   В разделе "Workflow permissions":
   - ✅ "Read and write permissions"
   - ✅ "Allow GitHub Actions to create and approve pull requests"

2. **Настройте права Packages:**
   ```
   GitHub → Settings → Actions → General → Workflow permissions
   ```
   - ✅ "Read packages"
   - ✅ "Write packages"

3. **Включите GHCR пайплайн:**
   ```bash
   mv .github/workflows/deploy-ghcr.yml.disabled .github/workflows/deploy-ghcr.yml
   ```

## 🤺 **Рекомендации**

### ✅ **Используйте Docker Direct (текущий)**
- Работает сразу без настроек
- Полная автоматизация
- Изоляция через контейнерами

### ✅ **Если Docker проблемы - используйте PM2**
- Самый надежный вариант
- Минимальные зависимости
- Работает на любом сервере

### ❌ **Избегай GHCR пока не настроите права**
- Требует дополнительную настройку
- Может вызывать ошибки прав доступа

## 🔧 Полная схема пайплайнов

| Файл | Статус | Описание |
|------|--------|----------|
| `deploy.yml` | ✅ **АКТИВНЫЙ** | Docker Direct развертывание |
| `deploy-simple-backup.yml` | 📦 Запасной | PM2 простой развертывание |
| `deploy-ghcr.yml.disabled` | ❌ Отключен | GHCR развертывание |
| `deploy-pm2.yml` | 📦 Запасной | Старый PM2 развертывание |

## 🚀 Проверка результатов

После изменений ваш основной пайплайн теперь:

1. **Собирает проект** с `npm run build`
2. **Создает архив** с Docker файлами
3. **Загружает на сервер** через SCP
4. **Устанавливает Docker** на сервере (если нужно)
5. **Собирает образ** локально на сервере
6. **Запускает контейнер** с Docker Compose

**Никаких внешних registries и прав доступа!** 🎉

## 🔍 Мониторинг

После развертывания проверьте на сервере:

```bash
ssh root@your-server
cd /opt/homework-bot

# Проверка Docker контейнера
docker ps | grep homework-bot
docker-compose logs -f

# Или если используется PM2:
pm2 status
pm2 logs homework-bot
```

**Проблема GHCR решена! Используйте текущий Docker Direct пайплайн.** ✅
