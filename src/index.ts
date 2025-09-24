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
  
  ctx.reply(helpMessage);
});

// Обработчик команды /ping
bot.command('ping', (ctx: Context) => {
  ctx.reply('🏓 Pong! Бот работает отлично!');
});

// Обработчик команды /about
bot.command('about', (ctx: Context) => {
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

// Универсальный обработчик всех типов сообщений
bot.on(['text', 'photo'], async (ctx: Context) => {
  try {
    const message = ctx.message as any;
    const userText = message.text || '';
    const photo = message.photo;
    
    // Определяем тип сообщения
    const hasText = userText && userText.trim().length > 0;
    const hasImage = photo && photo.length > 0;
    
    if (!hasText && !hasImage) {
      await ctx.reply('❌ Не удалось получить сообщение или изображение');
      return;
    }
    
    // Показываем индикатор "печатает"
    await ctx.sendChatAction('typing');
    
    // Показываем сообщение о процессе
    const processingMessage = await ctx.reply('🤖 Нейросеть думает...');
    
    // Системный промпт для AI
    const systemPrompt = `Решай задачи от пользователя как учитель в школе. Если сообщение не по теме уроков, напиши что этот вопрос не в тему и ты не будешь отвечать. Отвечай на русском языке, используя Markdown разметку.

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
      aiResponse = await openRouterService.sendUserMessage(userText, systemPrompt);
    }
    
    // Удаляем сообщение о процессе
    await ctx.deleteMessage(processingMessage.message_id);
    
    // Рендерим ответ AI в изображение с поддержкой Markdown + LaTeX
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
    
  } catch (error) {
    console.error('Ошибка при обработке сообщения:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
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
  try {
    // Сразу отвечаем на callback query, чтобы избежать timeout
    await ctx.answerCbQuery('🤖 Генерирую объяснение...');
    
    // Показываем индикатор "печатает"
    await ctx.sendChatAction('typing');
    
    // Показываем сообщение о процессе
    const processingMessage = await ctx.reply('🤖 Нейросеть объясняет...');
    
    // Получаем данные из callback_data
    const callbackData = (ctx.callbackQuery as any)?.data || '';
    
    // Получаем сохраненные данные
    const userMessageData = (global as any).explainData?.[callbackData];
    if (!userMessageData) {
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
      const messageForAI = userMessageData.text || 'Объясни подробно решение этой задачи';
      explainResponse = await openRouterService.sendUserMessage(messageForAI, explainPrompt);
    }
    
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
    
  } catch (error) {
    console.error('Ошибка при объяснении:', error);
    await ctx.reply('❌ Произошла ошибка при генерации объяснения');
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
