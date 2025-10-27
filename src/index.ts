import { Telegraf, Context } from 'telegraf';
import * as dotenv from 'dotenv';
import { LatexRenderer } from './latexRenderer.js';
import { OpenRouterService } from './openRouterService.js';
import { Analytics } from './analytics.js';
import { logger } from './loggerInstance.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Загружаем переменные окружения
dotenv.config();

// Проверяем наличие токена бота
if (!process.env.BOT_TOKEN) {
  logger.error('BOT_TOKEN не найден в переменных окружения!');
  console.error('❌ BOT_TOKEN не найден в переменных окружения!');
  console.log('Создайте файл .env и добавьте туда BOT_TOKEN=your_bot_token_here');
  process.exit(1);
}

// Проверяем наличие API ключа OpenRouter
if (!process.env.OPENROUTER_API_KEY) {
  logger.error('OPENROUTER_API_KEY не найден в переменных окружения!');
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

// Создаем экземпляр аналитики
const analytics = new Analytics(process.env.YANDEX_METRIKA_ID || '');

// Папка для временных изображений больше не нужна - отправляем напрямую в AI

// Обработчик команды /start
bot.start(async (ctx: Context) => {
  try {
    const userId = ctx.from?.id?.toString();
    const chatId = ctx.chat?.id?.toString();
    const messageId = ctx.message?.message_id?.toString();
    
    await logger.info('Пользователь запустил бота командой /start', undefined, userId, chatId, messageId);
    
    // Отслеживаем событие запуска бота
    await analytics.trackEvent('bot_start', userId);
    
    const welcomeMessage = `
🤖 Добро пожаловать в Homework Bot с AI!

Доступные команды:
/start - Показать это сообщение
/help - Помощь
/ping - Проверить работу бота
/about - Информация о боте
/latex - Преобразовать LaTeX формулу в изображение

🤖 Функции нейросети:
• Отправьте мне любой вопрос, и я отвечу
• Решаю уравнения, объясняю концепции, помогаю с задачами
• **Отправляйте фотографии** задач, уравнений, диаграмм - проанализирую!
• **Комбинируйте текст и изображения** - отправьте фото с вопросом!
• Ответы отображаются как изображения с поддержкой LaTeX формул
• Идеально для математических задач и объяснений

📐 LaTeX функции:
• Отправьте LaTeX формулу, и я преобразую её в изображение
• Поддерживаются: дроби, корни, интегралы, суммы, греческие буквы и многое другое
• Примеры: $\\frac{a}{b}$, $\\sqrt{x^2 + y^2}$, $\\sum_{i=1}^{n} i$

Просто отправьте мне любое сообщение, и я отвечу с помощью AI! 😊
    `;
    
    await ctx.reply(welcomeMessage);
  } catch (error) {
    await logger.logErrorSilently('Ошибка при обработке команды /start', error, ctx.from?.id?.toString(), ctx.chat?.id?.toString(), ctx.message?.message_id?.toString());
    await ctx.reply('😔 Произошла ошибка. Попробуйте позже.');
  }
});

// Обработчик команды /help
bot.help(async (ctx: Context) => {
  try {
    const userId = ctx.from?.id?.toString();
    const chatId = ctx.chat?.id?.toString();
    const messageId = ctx.message?.message_id?.toString();
    
    await logger.info('Пользователь запросил справку командой /help', undefined, userId, chatId, messageId);
    
    const helpMessage = `
📚 Справка по командам:

/start - Начать работу с ботом
/help - Показать эту справку
/ping - Проверить, что бот работает
/about - Узнать больше о боте
/latex - Преобразовать LaTeX формулу в изображение

🤖 Функции нейросети:
• Отправьте любой вопрос - получите ответ
• Решаю уравнения, задачи, объясняю концепции
• **Отправляйте фотографии** задач, уравнений, диаграмм - проанализирую!
• **Комбинируйте текст и изображения** - отправьте фото с вопросом!
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
    
    await ctx.reply(helpMessage);
  } catch (error) {
    await logger.logErrorSilently('Ошибка при обработке команды /help', error, ctx.from?.id?.toString(), ctx.chat?.id?.toString(), ctx.message?.message_id?.toString());
    await ctx.reply('😔 Произошла ошибка. Попробуйте позже.');
  }
});

// Обработчик команды /ping
bot.command('ping', async (ctx: Context) => {
  try {
    const userId = ctx.from?.id?.toString();
    const chatId = ctx.chat?.id?.toString();
    const messageId = ctx.message?.message_id?.toString();
    
    await logger.info('Пользователь проверил работу бота командой /ping', undefined, userId, chatId, messageId);
    await ctx.reply('🏓 Pong! Бот работает отлично!');
  } catch (error) {
    await logger.logErrorSilently('Ошибка при обработке команды /ping', error, ctx.from?.id?.toString(), ctx.chat?.id?.toString(), ctx.message?.message_id?.toString());
    await ctx.reply('😔 Произошла ошибка. Попробуйте позже.');
  }
});

// Обработчик команды /about
bot.command('about', async (ctx: Context) => {
  try {
    const userId = ctx.from?.id?.toString();
    const chatId = ctx.chat?.id?.toString();
    const messageId = ctx.message?.message_id?.toString();
    
    await logger.info('Пользователь запросил информацию о боте командой /about', undefined, userId, chatId, messageId);
    
    const aboutMessage = `
🤖 Homework Bot v2.2.0 с нейросетью

Создан с использованием:
• TypeScript
• Telegraf.js
• Node.js
• OpenRouter API (для нейросети)
• KaTeX (для LaTeX рендеринга)
• Marked (для Markdown разметки)

Этот бот поможет вам с домашними заданиями, отвечает на вопросы с помощью нейросети, анализирует фотографии задач и преобразует LaTeX формулы в изображения!
    `;
    
    await ctx.reply(aboutMessage);
  } catch (error) {
    await logger.logErrorSilently('Ошибка при обработке команды /about', error, ctx.from?.id?.toString(), ctx.chat?.id?.toString(), ctx.message?.message_id?.toString());
    await ctx.reply('😔 Произошла ошибка. Попробуйте позже.');
  }
});

// Обработчик команды /latex
bot.command('latex', async (ctx: Context) => {
  const userId = ctx.from?.id?.toString();
  const chatId = ctx.chat?.id?.toString();
  const messageId = ctx.message?.message_id?.toString();
  
  try {
    const messageText = (ctx.message as any)?.text || '';
    const latexFormula = messageText.replace('/latex', '').trim();
    
    if (!latexFormula) {
      await logger.warn('Пользователь отправил команду /latex без формулы', undefined, userId, chatId, messageId);
      await ctx.reply('❌ Пожалуйста, укажите LaTeX формулу после команды /latex\n\nПример: /latex \\frac{a}{b}');
      return;
    }
    
    await logger.logLatexProcessing(latexFormula, userId, chatId, messageId);
    
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
    
    await logger.info('LaTeX формула успешно обработана и отправлена', undefined, userId, chatId, messageId);
    
  } catch (error) {
    await logger.logErrorSilently('Ошибка при обработке LaTeX формулы', error, userId, chatId, messageId);
    await ctx.reply('😔 Произошла ошибка при обработке LaTeX формулы. Попробуйте позже.');
  }
});

// Универсальный обработчик всех типов сообщений
bot.on(['text', 'photo'], async (ctx: Context) => {
  const userId = ctx.from?.id?.toString();
  const chatId = ctx.chat?.id?.toString();
  const messageId = ctx.message?.message_id?.toString();
  
  try {
    const message = ctx.message as any;
    const userText = message.text || '';
    const photo = message.photo;
    
    // Определяем тип сообщения
    const hasText = userText && userText.trim().length > 0;
    const hasImage = photo && photo.length > 0;
    
    if (!hasText && !hasImage) {
      await logger.warn('Получено пустое сообщение от пользователя', undefined, userId, chatId, messageId);
      await ctx.reply('❌ Не удалось получить сообщение или изображение');
      return;
    }
    
    // Логируем сообщение пользователя и отправляем в аналитику
    if (hasText) {
      await logger.logUserMessage(userText, userId, chatId, messageId);
      await analytics.trackEvent('message_sent', userId, { type: 'text', length: userText.length });
    }
    if (hasImage) {
      await logger.logImageProcessing(`Изображение получено (${photo.length} вариантов)`, userId, chatId, messageId);
      await analytics.trackEvent('message_sent', userId, { type: 'image', variants: photo.length });
    }
    
    // Показываем индикатор "печатает"
    await ctx.sendChatAction('typing');
    
    // Показываем сообщение о процессе
    const processingMessage = await ctx.reply('🤖 Нейросеть думает...');
    
    // Системный промпт для AI
    const systemPrompt = `Решай задачи от пользователя как учитель в школе. 
Давай КРАТКИЕ решения без подробных объяснений. Только ответ и основные шаги.

Форматирование:
- Заголовки: # ## ###
- **жирный**, *курсив*
- Списки: - или 1.
- Код: \`\`\`язык\`\`\`
- Математика: $формула$ или $$формула$$

Будь кратким и по делу.`;

    let aiResponse: string;
    
    if (hasImage) {
      // Обрабатываем изображение
      const largestPhoto = photo[photo.length - 1];
      const fileId = largestPhoto.file_id;
      
      await logger.info('Начинаю обработку изображения с AI', { fileId }, userId, chatId, messageId);
      
      // Получаем файл от Telegram
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const response = await fetch(fileLink);
      const imageBuffer = await response.arrayBuffer();
      
      // Конвертируем изображение в base64 напрямую
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      
      // Формируем сообщение для AI
      const messageForAI = hasText 
        ? userText 
        : 'Проанализируй это изображение и помоги с задачей';
      
      // Получаем ответ от AI с анализом изображения
      aiResponse = await openRouterService.sendMessageWithImageBuffer(
        messageForAI,
        base64Image,
        'image/jpeg',
        systemPrompt
      );
    } else {
      // Только текстовое сообщение
      await logger.info('Отправляю текстовое сообщение в AI', undefined, userId, chatId, messageId);
      aiResponse = await openRouterService.sendUserMessage(userText, systemPrompt);
    }
    
    // Логируем ответ AI и отправляем в аналитику
    await logger.logAIResponse(aiResponse, userId, chatId, messageId);
    await analytics.trackEvent('ai_response', userId, { 
      hasImage: hasImage,
      responseLength: aiResponse.length
    });
    
    // Удаляем сообщение о процессе
    await ctx.deleteMessage(processingMessage.message_id);
    
    // Рендерим ответ AI в изображение с поддержкой Markdown + LaTeX
    await logger.info('Начинаю рендеринг ответа AI в изображение', undefined, userId, chatId, messageId);
    const responseImagePath = await latexRenderer.renderMarkdownWithLatexToPng(aiResponse, {
      fontSize: 18,
      maxWidth: 1000,
      textAlign: 'left',
      lineHeight: 1.4,
    });

    // Подпись для ответа
    const caption = '🤖 Ответ от нейросети';

    // Создаем клавиатуру с кнопкой "Объяснить решение"
    // Используем простой подход - сохраняем данные в глобальной переменной
    const explainId = `explain_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    
    // Сохраняем данные для объяснения (в реальном проекте лучше использовать базу данных)
    (global as any).explainData = (global as any).explainData || {};
    (global as any).explainData[explainId] = {
      text: userText,
      hasImage: hasImage,
      imageData: hasImage ? {
        fileId: photo[photo.length - 1].file_id
      } : null
    };
    
    const keyboard = {
      inline_keyboard: [[
        {
          text: '📚 Объяснить решение',
          callback_data: explainId
        }
      ]]
    };

    // Отправляем изображение с ответом и кнопкой
    await ctx.replyWithPhoto({ source: responseImagePath }, {
      caption: caption,
      reply_markup: keyboard
    });

    // Очищаем временный файл ответа
    latexRenderer.cleanup(responseImagePath);
    
    await logger.info('Ответ AI успешно отправлен пользователю', undefined, userId, chatId, messageId);
    
  } catch (error) {
    await logger.logErrorSilently('Ошибка при обработке сообщения пользователя', error, userId, chatId, messageId);
    
    // Если нейросеть недоступна, отправляем обычный ответ
    const fallbackResponses = [
      'Извините, нейросеть временно недоступна. Попробуйте позже.',
      'Произошла ошибка. Попробуйте еще раз.',
      'Сервис временно не отвечает. Попробуйте позже.'
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    await ctx.reply(`${randomResponse}\n\n💡 Попробуйте отправить сообщение или команду /help.`);
  }
});

// Обработчик кнопки "Объяснить решение"
bot.action(/^explain_/, async (ctx: Context) => {
  const userId = ctx.from?.id?.toString();
  const chatId = ctx.chat?.id?.toString();
  const messageId = ctx.callbackQuery?.message?.message_id?.toString();
  
  try {
    // Сразу отвечаем на callback query, чтобы избежать timeout
    await ctx.answerCbQuery('🤖 Генерирую объяснение...');
    
    await logger.info('Пользователь запросил подробное объяснение', undefined, userId, chatId, messageId);
    
    // Показываем индикатор "печатает"
    await ctx.sendChatAction('typing');
    
    // Показываем сообщение о процессе
    const processingMessage = await ctx.reply('🤖 Нейросеть объясняет...');
    
    // Получаем данные из callback_data
    const callbackData = (ctx.callbackQuery as any)?.data || '';
    
    // Получаем сохраненные данные
    const userMessageData = (global as any).explainData?.[callbackData];
    if (!userMessageData) {
      await logger.warn('Не удалось найти данные для объяснения', { callbackData }, userId, chatId, messageId);
      await ctx.reply('❌ Не удалось найти данные для объяснения');
      return;
    }
    
    // Системный промпт для подробного объяснения
    const explainPrompt = `Решай задачи от пользователя как учитель в школе. Если сообщение не по теме уроков, напиши что этот вопрос не в тему и ты не будешь отвечать. Отвечай на русском языке, используя Markdown разметку.

Давай ПОДРОБНОЕ объяснение решения с пошаговыми объяснениями, почему каждый шаг делается именно так.

Форматирование:
- Заголовки: # ## ###
- **жирный**, *курсив*
- Списки: - или 1.
- Код: \`\`\`язык\`\`\`
- Математика: $формула$ или $$формула$$

Объясняй каждый шаг подробно и понятно.`;

    let explainResponse: string;
    
    if (userMessageData.hasImage && userMessageData.imageData) {
      // Если было изображение, анализируем его снова
      const fileId = userMessageData.imageData.fileId;
      
      await logger.info('Генерирую подробное объяснение с анализом изображения', { fileId }, userId, chatId, messageId);
      
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const response = await fetch(fileLink);
      const imageBuffer = await response.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      
      const messageForAI = userMessageData.text || 'Объясни подробно решение этой задачи';
      
      explainResponse = await openRouterService.sendMessageWithImageBuffer(
        messageForAI,
        base64Image,
        'image/jpeg',
        explainPrompt
      );
    } else {
      // Если был только текст
      await logger.info('Генерирую подробное объяснение для текстового сообщения', undefined, userId, chatId, messageId);
      const messageForAI = userMessageData.text || 'Объясни подробно решение этой задачи';
      explainResponse = await openRouterService.sendUserMessage(messageForAI, explainPrompt);
    }
    
    // Логируем ответ с объяснением и отправляем в аналитику
    await logger.logAIResponse(`Подробное объяснение: ${explainResponse}`, userId, chatId, messageId);
    await analytics.trackEvent('explanation_generated', userId, {
      hasImage: userMessageData.hasImage,
      responseLength: explainResponse.length
    });
    
    // Удаляем сообщение о процессе
    await ctx.deleteMessage(processingMessage.message_id);
    
    // Рендерим объяснение в изображение
    const explainImagePath = await latexRenderer.renderMarkdownWithLatexToPng(explainResponse, {
      fontSize: 18,
      maxWidth: 1000,
      textAlign: 'left',
      lineHeight: 1.4,
    });

    // Отправляем объяснение
    await ctx.replyWithPhoto({ source: explainImagePath }, {
      caption: '📚 Подробное объяснение от нейросети',
    });

    // Очищаем временный файл
    latexRenderer.cleanup(explainImagePath);
    
    // Очищаем сохраненные данные
    delete (global as any).explainData[callbackData];
    
    await logger.info('Подробное объяснение успешно отправлено', undefined, userId, chatId, messageId);
    
  } catch (error) {
    await logger.logErrorSilently('Ошибка при генерации подробного объяснения', error, userId, chatId, messageId);
    await ctx.reply('❌ Произошла ошибка при генерации объяснения');
  }
});

// Обработчик ошибок
bot.catch(async (err: any, ctx: Context) => {
  const userId = ctx.from?.id?.toString();
  const chatId = ctx.chat?.id?.toString();
  const messageId = ctx.message?.message_id?.toString();
  
  await logger.logErrorSilently('Необработанная ошибка в боте', err, userId, chatId, messageId);
  await ctx.reply('😔 Произошла ошибка. Попробуйте позже.');
});

// Запуск бота
logger.info('Запуск бота...');
console.log('🚀 Запуск бота...');

bot.launch()
  .then(async () => {
    await logger.info('Бот успешно запущен!');
    console.log('✅ Бот успешно запущен!');
    console.log('📱 Бот готов к работе в Telegram');
  })
  .catch(async (error) => {
    await logger.logErrorSilently('Ошибка при запуске бота', error);
    console.error('❌ Ошибка при запуске бота:', error);
    process.exit(1);
  });

// Graceful stop
process.once('SIGINT', async () => {
  await logger.info('Получен сигнал SIGINT, завершаю работу...');
  console.log('🛑 Получен сигнал SIGINT, завершаю работу...');
  latexRenderer.cleanupAll();
  bot.stop('SIGINT');
});

process.once('SIGTERM', async () => {
  await logger.info('Получен сигнал SIGTERM, завершаю работу...');
  console.log('🛑 Получен сигнал SIGTERM, завершаю работу...');
  latexRenderer.cleanupAll();
  bot.stop('SIGTERM');
});
