# 🤖 Homework Bot с AI

Telegram бот с интеграцией AI для помощи с домашними заданиями, созданный с использованием TypeScript, Telegraf.js и OpenRouter API.

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

3. Получите API ключ OpenRouter:
   - Зарегистрируйтесь на [OpenRouter](https://openrouter.ai/)
   - Создайте API ключ в панели управления
   - Скопируйте полученный ключ

4. Создайте файл `.env` в корне проекта и добавьте ваши ключи:
   ```
   BOT_TOKEN=your_actual_bot_token_here
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
   ```
   
   **Важно:** Замените значения на реальные токены!

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

## 🤖 AI функции

Бот интегрирован с OpenRouter API и может отвечать на любые вопросы:

- **Умные ответы**: Отправьте любой вопрос и получите развернутый ответ от AI
- **Решение задач**: AI решает уравнения, математические задачи, объясняет концепции
- **LaTeX рендеринг**: Только ответы AI отображаются как изображения с поддержкой математических формул
- **Пошаговые решения**: AI показывает подробные решения с формулами и объяснениями
- **Образовательная помощь**: Идеально для помощи с домашними заданиями по математике, физике, программированию

### Как это работает:
1. Вы отправляете вопрос (например: "Реши уравнение $x^2 + 5x + 6 = 0$")
2. AI получает ваш вопрос и генерирует ответ с решением
3. Ответ AI рендерится в красивое изображение с LaTeX формулами
4. Вы получаете изображение с полным решением задачи

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

## 💡 Примеры использования AI

### Математические задачи
- "Реши уравнение $x^2 + 5x + 6 = 0$"
- "Объясни теорему Пифагора"
- "Как найти производную функции $f(x) = x^3 + 2x^2 - 5x + 1$?"

### Физика
- "Объясни закон Ньютона"
- "Как работает электромагнитная индукция?"
- "Реши задачу: тело массой 2 кг движется со скоростью 10 м/с..."

### Программирование
- "Объясни принципы ООП"
- "Как работает рекурсия?"
- "Помоги написать функцию на Python"

### Общие вопросы
- "Что такое квантовая механика?"
- "Объясни принцип работы интернета"
- "Как работает машинное обучение?"

## 🛠 Технологии

- **TypeScript** - Типизированный JavaScript
- **Telegraf.js** - Фреймворк для создания Telegram ботов
- **Node.js** - Среда выполнения JavaScript
- **OpenRouter API** - Интеграция с различными AI моделями
- **KaTeX** - Рендеринг LaTeX формул
- **node-html-to-image** - Генерация изображений из HTML
- **Axios** - HTTP клиент для API запросов
- **dotenv** - Загрузка переменных окружения

## 📁 Структура проекта

```
homework-bot/
├── src/
│   ├── index.ts              # Основной файл бота
│   ├── latexRenderer.ts      # Модуль для рендеринга LaTeX
│   └── openRouterService.ts  # Сервис для работы с OpenRouter API
├── temp/                     # Временные файлы изображений (создается автоматически)
├── dist/                     # Скомпилированные файлы (создается автоматически)
├── package.json              # Зависимости и скрипты
├── tsconfig.json             # Конфигурация TypeScript
├── env.example               # Пример файла окружения
└── README.md                # Документация
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

### Работа с AI через OpenRouter

```typescript
import { OpenRouterService } from './openRouterService';

const openRouterService = new OpenRouterService(apiKey, model);

// Отправка сообщения в AI
const aiResponse = await openRouterService.sendUserMessage(
  userMessage, 
  systemPrompt
);

// Рендеринг ответа AI в изображение
const imagePath = await latexRenderer.renderTextWithInlineLatexToPng(aiResponse);
await ctx.replyWithPhoto({ source: imagePath });
```

### Работа с LaTeX формулами

```typescript
import { LatexRenderer } from './latexRenderer';

const latexRenderer = new LatexRenderer();

// Проверка, является ли текст LaTeX формулой
if (latexRenderer.extractLatexFormulas(userMessage).length > 0) {
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
2. Добавьте переменные окружения:
   - `BOT_TOKEN` - токен Telegram бота
   - `OPENROUTER_API_KEY` - API ключ OpenRouter
   - `OPENROUTER_MODEL` - модель AI (опционально)
3. Подключите GitHub репозиторий
4. Включите автоматический деплой

### VPS/Сервер

1. Склонируйте репозиторий на сервер
2. Установите зависимости: `npm install`
3. Создайте файл `.env` с токенами бота и OpenRouter
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
