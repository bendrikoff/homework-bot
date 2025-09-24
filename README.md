# 🤖 Homework Bot

Telegram бот, созданный с использованием TypeScript и Telegraf.js.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка бота

1. Скопируйте файл `env.example` в `.env`:
   ```bash
   cp env.example .env
   ```

2. Получите токен бота у [@BotFather](https://t.me/BotFather) в Telegram:
   - Отправьте команду `/newbot`
   - Следуйте инструкциям для создания бота
   - Скопируйте полученный токен

3. Создайте файл `.env` в корне проекта и добавьте ваш токен:
   ```
   BOT_TOKEN=your_actual_bot_token_here
   ```
   
   **Важно:** Замените `your_actual_bot_token_here` на реальный токен вашего бота!

### 3. Запуск бота

#### Режим разработки (с автоперезагрузкой):
```bash
npm run dev
```

#### Обычный запуск:
```bash
npm run build
npm start
```

#### Запуск с отслеживанием изменений:
```bash
npm run watch
```

## 📋 Доступные команды

- `/start` - Начать работу с ботом
- `/help` - Показать справку
- `/ping` - Проверить работу бота
- `/about` - Информация о боте
- `/latex формула` - Преобразовать LaTeX формулу в изображение

## 📐 LaTeX функции

Бот автоматически распознает и преобразует LaTeX формулы в изображения:

### Поддерживаемые форматы:
- `$формула$` - инлайн формулы
- `\(формула\)` - альтернативный формат инлайн
- `\[формула\]` - блочные формулы
- Команда `/latex формула`

### Примеры формул:
- `$\frac{a}{b}$` - дроби
- `$\sqrt{x^2 + y^2}$` - корни
- `$\sum_{i=1}^{n} i$` - суммы
- `$\int_0^\infty e^{-x} dx$` - интегралы
- `$\alpha + \beta = \gamma$` - греческие буквы
- `$\lim_{x \to 0} \frac{\sin x}{x} = 1$` - пределы
- `$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$` - матрицы

## 🛠 Технологии

- **TypeScript** - Типизированный JavaScript
- **Telegraf.js** - Фреймворк для создания Telegram ботов
- **Node.js** - Среда выполнения JavaScript
- **MathJax** - Рендеринг LaTeX формул
- **Canvas** - Генерация изображений
- **dotenv** - Загрузка переменных окружения

## 📁 Структура проекта

```
homework-bot/
├── src/
│   ├── index.ts          # Основной файл бота
│   └── latexRenderer.ts  # Модуль для рендеринга LaTeX
├── temp/                 # Временные файлы изображений (создается автоматически)
├── dist/                 # Скомпилированные файлы (создается автоматически)
├── package.json          # Зависимости и скрипты
├── tsconfig.json         # Конфигурация TypeScript
├── env.example           # Пример файла окружения
└── README.md            # Документация
```

## 🔧 Разработка

### Добавление новых команд

Чтобы добавить новую команду, используйте метод `bot.command()`:

```typescript
bot.command('mycommand', (ctx: Context) => {
  ctx.reply('Ответ на команду!');
});
```

### Обработка сообщений

Для обработки всех текстовых сообщений используйте:

```typescript
bot.on('text', (ctx: Context) => {
  const message = ctx.message?.text || '';
  // Ваша логика обработки
});
```

### Обработка ошибок

```typescript
bot.catch((err: any, ctx: Context) => {
  console.error('Ошибка:', err);
  ctx.reply('Произошла ошибка');
});
```

### Работа с LaTeX формулами

```typescript
import { LatexRenderer } from './latexRenderer';

const latexRenderer = new LatexRenderer();

// Проверка, является ли текст LaTeX формулой
if (latexRenderer.isLatexFormula(userMessage)) {
  // Рендеринг LaTeX в изображение
  const imagePath = await latexRenderer.renderLatexToPng(userMessage);
  
  // Отправка изображения
  await ctx.replyWithPhoto({ source: imagePath });
  
  // Очистка временного файла
  latexRenderer.cleanup(imagePath);
}
```

## 🚀 Деплой

### Heroku

1. Создайте приложение на Heroku
2. Добавьте переменную окружения `BOT_TOKEN`
3. Подключите GitHub репозиторий
4. Включите автоматический деплой

### VPS/Сервер

1. Склонируйте репозиторий на сервер
2. Установите зависимости: `npm install`
3. Создайте файл `.env` с токеном бота
4. Соберите проект: `npm run build`
5. Запустите: `npm start`

## 📝 Лицензия

MIT License

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📞 Поддержка

Если у вас есть вопросы или проблемы, создайте Issue в репозитории.
