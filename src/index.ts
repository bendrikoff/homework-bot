import { Telegraf, Context } from 'telegraf';
import * as dotenv from 'dotenv';
import { LatexRenderer } from './latexRenderer';

// Загружаем переменные окружения
dotenv.config();

// Проверяем наличие токена бота
if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не найден в переменных окружения!');
  console.log('Создайте файл .env и добавьте туда BOT_TOKEN=your_bot_token_here');
  process.exit(1);
}

// Создаем экземпляр бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Создаем экземпляр рендерера LaTeX
const latexRenderer = new LatexRenderer();

// Обработчик команды /start
bot.start((ctx: Context) => {
  const welcomeMessage = `
🤖 Добро пожаловать в Homework Bot!

Доступные команды:
/start - Показать это сообщение
/help - Помощь
/ping - Проверить работу бота
/about - Информация о боте
/latex - Преобразовать LaTeX формулу в изображение

📐 LaTeX функции:
• Отправьте LaTeX формулу, и я преобразую её в изображение
• Поддерживаются: дроби, корни, интегралы, суммы, греческие буквы и многое другое
• Примеры: $\\frac{a}{b}$, $\\sqrt{x^2 + y^2}$, $\\sum_{i=1}^{n} i$

Просто отправьте мне любое сообщение, и я отвечу! 😊
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

📐 LaTeX формулы:
• Отправьте формулу в формате: $формула$
• Или используйте команду /latex формула
• Примеры:
  - $\\frac{a}{b}$ - дробь
  - $\\sqrt{x^2 + y^2}$ - корень
  - $\\sum_{i=1}^{n} i$ - сумма
  - $\\int_0^\\infty e^{-x} dx$ - интеграл
  - $\\alpha + \\beta = \\gamma$ - греческие буквы

💡 Совет: Вы можете отправлять мне текстовые сообщения или LaTeX формулы!
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
🤖 Homework Bot v1.0.0

Создан с использованием:
• TypeScript
• Telegraf.js
• Node.js
• MathJax (для LaTeX рендеринга)

Этот бот поможет вам с домашними заданиями и преобразует LaTeX формулы в изображения!
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
  
  // Проверяем, является ли сообщение LaTeX формулой
  if (latexRenderer.extractLatexFormulas(userMessage).length > 0) {
    try {
      const processingMessage = await ctx.reply('🔄 Обнаружена LaTeX-разметка. Рендерю текст с формулами...');

      const imagePath = await latexRenderer.renderTextWithInlineLatexToPng(userMessage, {
        fontSize: 22,
        maxWidth: 1000,
        textAlign: 'left',
        lineHeight: 1.5,
      });

      await ctx.replyWithPhoto({ source: imagePath }, {
        caption: '✅ Готово: текст + формулы.',
      });

      await ctx.deleteMessage(processingMessage.message_id);
      latexRenderer.cleanup(imagePath);
      return;
    } catch (err) {
      console.error(err);
      await ctx.reply('❌ Не смог отрендерить текст с формулами.');
      return;
    }
  } else {
    // Обычный ответ на текстовое сообщение
    const responses = [
      'Интересно! Расскажите больше.',
      'Понял вас! Что еще хотите узнать?',
      'Хороший вопрос! Давайте разберемся.',
      'Отлично! Продолжайте.',
      'Я слушаю! Что еще?'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    ctx.reply(`${randomResponse}\n\n💡 Попробуйте отправить LaTeX формулу (например: $\\frac{a}{b}$) или команду /help для получения списка доступных команд.`);
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
