import { Telegraf, Context } from 'telegraf';
import * as dotenv from 'dotenv';
import { LatexRenderer } from './latexRenderer';
import { OpenRouterService } from './openRouterService';
import * as fs from 'fs';
import * as path from 'path';

// Загружаем переменные окружения
dotenv.config();

// Проверяем наличие токена бота
if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не найден в переменных окружения!');
  console.log('Создайте файл .env и добавьте туда BOT_TOKEN=your_bot_token_here');
  process.exit(1);
}

// Проверяем наличие API ключа OpenRouter
if (!process.env.OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY не найден в переменных окружения!');
  console.log('Создайте файл .env и добавьте туда OPENROUTER_API_KEY=your_api_key_here');
  process.exit(1);
}

// Создаем экземпляр бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Создаем экземпляр рендерера LaTeX
const latexRenderer = new LatexRenderer();

// Создаем экземпляр сервиса OpenRouter
const openRouterService = new OpenRouterService(
  process.env.OPENROUTER_API_KEY!,
  process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free'
);

// Папка для временных изображений больше не нужна - отправляем напрямую в AI

// Обработчик команды /start
bot.start((ctx: Context) => {
  const welcomeMessage = `
🤖 Добро пожаловать в Homework Bot с AI!

Доступные команды:
/start - Показать это сообщение
/help - Помощь
/ping - Проверить работу бота
/about - Информация о боте
/latex - Преобразовать LaTeX формулу в изображение

🤖 AI функции:
• Отправьте мне любой вопрос, и я отвечу с помощью AI
• AI решает уравнения, объясняет концепции, помогает с задачами
• **Отправляйте фотографии** задач, уравнений, диаграмм - AI их проанализирует!
• Ответы отображаются как изображения с поддержкой LaTeX формул
• Идеально для математических задач и объяснений

📐 LaTeX функции:
• Отправьте LaTeX формулу, и я преобразую её в изображение
• Поддерживаются: дроби, корни, интегралы, суммы, греческие буквы и многое другое
• Примеры: $\\frac{a}{b}$, $\\sqrt{x^2 + y^2}$, $\\sum_{i=1}^{n} i$

Просто отправьте мне любое сообщение, и я отвечу с помощью AI! 😊
  `;
  
  ctx.reply(welcomeMessage);
});

// Обработчик команды /help
bot.help((ctx: Context) => {
  const helpMessage = `
📚 Справка по командам:

/start - Начать работу с ботом
/help - Показать эту справку
/ping - Проверить, что бот работает
/about - Узнать больше о боте
/latex - Преобразовать LaTeX формулу в изображение

🤖 AI функции:
• Отправьте любой вопрос - получите ответ от AI
• AI решает уравнения, задачи, объясняет концепции
• **Отправляйте фотографии** задач, уравнений, диаграмм - AI их проанализирует!
• Ответы отображаются как изображения с LaTeX поддержкой
• Идеально для математики, физики, программирования

📐 LaTeX формулы:
• Отправьте формулу в формате: $формула$
• Или используйте команду /latex формула
• Примеры:
  - $\\frac{a}{b}$ - дробь
  - $\\sqrt{x^2 + y^2}$ - корень
  - $\\sum_{i=1}^{n} i$ - сумма
  - $\\int_0^\\infty e^{-x} dx$ - интеграл
  - $\\alpha + \\beta = \\gamma$ - греческие буквы

💡 Совет: Отправьте мне любой вопрос, и я отвечу с помощью AI!
  `;
  
  ctx.reply(helpMessage);
});

// Обработчик команды /ping
bot.command('ping', (ctx: Context) => {
  ctx.reply('🏓 Pong! Бот работает отлично!');
});

// Обработчик команды /about
bot.command('about', (ctx: Context) => {
  const aboutMessage = `
🤖 Homework Bot v2.1.0 с AI и Vision

Создан с использованием:
• TypeScript
• Telegraf.js
• Node.js
• OpenRouter API (для AI ответов и анализа изображений)
• KaTeX (для LaTeX рендеринга)
• Marked (для Markdown разметки)

Этот бот поможет вам с домашними заданиями, отвечает на вопросы с помощью AI, анализирует фотографии задач и преобразует LaTeX формулы в изображения!
  `;
  
  ctx.reply(aboutMessage);
});

// Обработчик команды /latex
bot.command('latex', async (ctx: Context) => {
  const messageText = (ctx.message as any)?.text || '';
  const latexFormula = messageText.replace('/latex', '').trim();
  
  if (!latexFormula) {
    ctx.reply('❌ Пожалуйста, укажите LaTeX формулу после команды /latex\n\nПример: /latex \\frac{a}{b}');
    return;
  }
  
  try {
    // Показываем сообщение о процессе
    const processingMessage = await ctx.reply('🔄 Обрабатываю LaTeX формулу...');
    
    // Рендерим LaTeX в изображение
    const imagePath = await latexRenderer.renderLatexToPng(latexFormula);
    
    // Отправляем изображение
    await ctx.replyWithPhoto(
      { source: imagePath },
      {
        caption: `📐 LaTeX формула:\n\`${latexFormula}\``,
        parse_mode: 'Markdown'
      }
    );
    
    // Удаляем сообщение о процессе
    await ctx.deleteMessage(processingMessage.message_id);
    
    // Очищаем временный файл
    latexRenderer.cleanup(imagePath);
    
  } catch (error) {
    console.error('Ошибка при обработке LaTeX:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    ctx.reply(`❌ Ошибка при обработке LaTeX формулы:\n\`${errorMessage}\``, {
      parse_mode: 'Markdown'
    });
  }
});

// Обработчик всех текстовых сообщений
bot.on('text', async (ctx: Context) => {
  const userMessage = (ctx.message as any)?.text || '';
  
  // Всегда отправляем сообщение в AI и получаем ответ
  try {
    const processingMessage = await ctx.reply('🤖 AI думает...');
    
    // Системный промпт для AI
    const systemPrompt = `Ты полезный AI-ассистент для помощи с домашними заданиями. 
Отвечай на русском языке, используя Markdown разметку для структурирования ответов.

Правила форматирования:
- Используй заголовки (# ## ###) для разделения разделов
- Используй **жирный текст** для важных моментов
- Используй *курсив* для выделения
- Используй списки (- или 1.) для пошаговых решений
- Используй блоки кода (\`\`\`язык\`\`\`) для примеров кода
- Используй > для цитат и важных замечаний

Для математических формул используй LaTeX синтаксис:
- $формула$ для инлайн формул
- $$формула$$ для блочных формул

Будь дружелюбным и полезным. Объясняй сложные концепции простым языком.
Если пользователь просит решить уравнение или задачу, обязательно покажи пошаговое решение с формулами.`;

    // Получаем ответ от AI
    const aiResponse = await openRouterService.sendUserMessage(userMessage, systemPrompt);
    
    // Удаляем сообщение о процессе
    await ctx.deleteMessage(processingMessage.message_id);
    
    // Рендерим ответ AI в изображение с поддержкой Markdown + LaTeX
    const imagePath = await latexRenderer.renderMarkdownWithLatexToPng(aiResponse, {
      fontSize: 18,
      maxWidth: 1000,
      textAlign: 'left',
      lineHeight: 1.4,
    });

    // Отправляем изображение с ответом
    await ctx.replyWithPhoto({ source: imagePath }, {
      caption: '🤖 Ответ от AI',
    });

    // Очищаем временный файл
    latexRenderer.cleanup(imagePath);
    
  } catch (error) {
    console.error('Ошибка при работе с AI:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Если AI недоступен, отправляем обычный ответ
    const fallbackResponses = [
      'Извините, AI временно недоступен. Попробуйте позже.',
      'Произошла ошибка при обращении к AI. Попробуйте еще раз.',
      'AI сервис временно не отвечает. Попробуйте позже.'
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    await ctx.reply(`${randomResponse}\n\n💡 Попробуйте отправить LaTeX формулу (например: $\\frac{a}{b}$) или команду /help для получения списка доступных команд.`);
  }
});

// Обработчик изображений
bot.on('photo', async (ctx: Context) => {
  try {
    const processingMessage = await ctx.reply('🖼️ Анализирую изображение...');
    
    // Получаем информацию о фото
    const photo = (ctx.message as any)?.photo;
    if (!photo || photo.length === 0) {
      await ctx.reply('❌ Не удалось получить изображение');
      return;
    }
    
    // Берем фото наибольшего размера
    const largestPhoto = photo[photo.length - 1];
    const fileId = largestPhoto.file_id;
    
    // Получаем файл от Telegram
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await fetch(fileLink);
    const imageBuffer = await response.arrayBuffer();
    
    // Конвертируем изображение в base64 напрямую
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    // Системный промпт для анализа изображений
    const systemPrompt = `Ты полезный AI-ассистент для помощи с домашними заданиями. 
Ты умеешь анализировать изображения с математическими задачами, уравнениями, диаграммами, графиками.

Отвечай на русском языке, используя Markdown разметку для структурирования ответов.

Правила анализа изображений:
- Если на изображении математическая задача - решай её пошагово
- Если уравнение - покажи полное решение с формулами
- Если график или диаграмма - объясни что на них изображено
- Если текст - проанализируй его и дай развернутый ответ
- Используй LaTeX синтаксис для математических формул: $формула$ и $$формула$$
- Структурируй ответ с заголовками, списками, выделением важных моментов

Будь дружелюбным и полезным. Объясняй сложные концепции простым языком.`;

    // Получаем ответ от AI с анализом изображения напрямую
    const aiResponse = await openRouterService.sendMessageWithImageBuffer(
      'Проанализируй это изображение и помоги с задачей',
      base64Image,
      'image/jpeg',
      systemPrompt
    );
    
    // Удаляем сообщение о процессе
    await ctx.deleteMessage(processingMessage.message_id);
    
    // Рендерим ответ AI в изображение с поддержкой Markdown + LaTeX
    const responseImagePath = await latexRenderer.renderMarkdownWithLatexToPng(aiResponse, {
      fontSize: 18,
      maxWidth: 1000,
      textAlign: 'left',
      lineHeight: 1.4,
    });

    // Отправляем изображение с ответом
    await ctx.replyWithPhoto({ source: responseImagePath }, {
      caption: '🤖 Анализ изображения от AI',
    });

    // Очищаем временный файл ответа
    latexRenderer.cleanup(responseImagePath);
    
  } catch (error) {
    console.error('Ошибка при обработке изображения:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Если AI недоступен, отправляем обычный ответ
    const fallbackResponses = [
      'Извините, не удалось проанализировать изображение. Попробуйте позже.',
      'Произошла ошибка при обработке изображения. Попробуйте еще раз.',
      'AI сервис временно не отвечает. Попробуйте позже.'
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    await ctx.reply(`${randomResponse}\n\n💡 Попробуйте отправить текстовое сообщение или команду /help для получения списка доступных команд.`);
  }
});

// Обработчик ошибок
bot.catch((err: any, ctx: Context) => {
  console.error('Ошибка в боте:', err);
  ctx.reply('😔 Произошла ошибка. Попробуйте позже.');
});

// Запуск бота
console.log('🚀 Запуск бота...');

bot.launch()
  .then(() => {
    console.log('✅ Бот успешно запущен!');
    console.log('📱 Бот готов к работе в Telegram');
  })
  .catch((error) => {
    console.error('❌ Ошибка при запуске бота:', error);
    process.exit(1);
  });

// Graceful stop
process.once('SIGINT', () => {
  console.log('🛑 Получен сигнал SIGINT, завершаю работу...');
  latexRenderer.cleanupAll();
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('🛑 Получен сигнал SIGTERM, завершаю работу...');
  latexRenderer.cleanupAll();
  bot.stop('SIGTERM');
});
