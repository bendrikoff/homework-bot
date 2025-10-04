import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  chatId?: string;
  messageId?: string;
}

export class Logger {
  private logLevel: LogLevel;
  private logDir: string;
  private logFile: string;
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private maxFiles: number = 5;

  constructor(logLevel: LogLevel = LogLevel.INFO, logDir: string = 'logs') {
    this.logLevel = logLevel;
    // Используем переменную окружения LOG_DIR если установлена, иначе относительный путь
    this.logDir = process.env.LOG_DIR ? process.env.LOG_DIR : path.join(__dirname, '..', logDir);
    this.logFile = path.join(this.logDir, `bot_${this.getDateString()}.log`);
    
    // Создаем директорию для логов если её нет
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private getLevelString(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return 'DEBUG';
      case LogLevel.INFO: return 'INFO';
      case LogLevel.WARN: return 'WARN';
      case LogLevel.ERROR: return 'ERROR';
      default: return 'UNKNOWN';
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private async rotateLogFile(): Promise<void> {
    try {
      if (!fs.existsSync(this.logFile)) return;

      const stats = fs.statSync(this.logFile);
      if (stats.size < this.maxFileSize) return;

      // Переименовываем текущий файл
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedFile = path.join(this.logDir, `bot_${this.getDateString()}_${timestamp}.log`);
      fs.renameSync(this.logFile, rotatedFile);

      // Удаляем старые файлы
      this.cleanupOldLogs();
    } catch (error) {
      console.error('Ошибка при ротации лог файла:', error);
    }
  }

  private cleanupOldLogs(): void {
    try {
      const files = fs.readdirSync(this.logDir)
        .filter(file => file.startsWith('bot_') && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.logDir, file),
          mtime: fs.statSync(path.join(this.logDir, file)).mtime
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Удаляем файлы сверх лимита
      if (files.length > this.maxFiles) {
        for (let i = this.maxFiles; i < files.length; i++) {
          fs.unlinkSync(files[i].path);
        }
      }
    } catch (error) {
      console.error('Ошибка при очистке старых логов:', error);
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = this.getLevelString(entry.level);
    const context = entry.userId ? `[User:${entry.userId}]` : '';
    const chatContext = entry.chatId ? `[Chat:${entry.chatId}]` : '';
    const messageContext = entry.messageId ? `[Msg:${entry.messageId}]` : '';
    
    let logLine = `${timestamp} [${level}] ${context}${chatContext}${messageContext} ${entry.message}`;
    
    if (entry.data) {
      logLine += ` | Data: ${JSON.stringify(entry.data, null, 2)}`;
    }
    
    return logLine;
  }

  private async writeToFile(logLine: string): Promise<void> {
    try {
      await this.rotateLogFile();
      fs.appendFileSync(this.logFile, logLine + '\n');
    } catch (error) {
      console.error('Ошибка при записи в лог файл:', error);
    }
  }

  private async log(level: LogLevel, message: string, data?: any, userId?: string, chatId?: string, messageId?: string): Promise<void> {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      data,
      userId,
      chatId,
      messageId
    };

    const logLine = this.formatLogEntry(entry);
    
    // Выводим в консоль
    if (level >= LogLevel.ERROR) {
      console.error(logLine);
    } else if (level >= LogLevel.WARN) {
      console.warn(logLine);
    } else {
      console.log(logLine);
    }

    // Записываем в файл
    await this.writeToFile(logLine);
  }

  async debug(message: string, data?: any, userId?: string, chatId?: string, messageId?: string): Promise<void> {
    await this.log(LogLevel.DEBUG, message, data, userId, chatId, messageId);
  }

  async info(message: string, data?: any, userId?: string, chatId?: string, messageId?: string): Promise<void> {
    await this.log(LogLevel.INFO, message, data, userId, chatId, messageId);
  }

  async warn(message: string, data?: any, userId?: string, chatId?: string, messageId?: string): Promise<void> {
    await this.log(LogLevel.WARN, message, data, userId, chatId, messageId);
  }

  async error(message: string, error?: Error | any, userId?: string, chatId?: string, messageId?: string): Promise<void> {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    
    await this.log(LogLevel.ERROR, message, errorData, userId, chatId, messageId);
  }

  // Специальные методы для логирования пользовательских сообщений
  async logUserMessage(message: string, userId?: string, chatId?: string, messageId?: string): Promise<void> {
    await this.info(`Пользователь отправил сообщение: ${message}`, undefined, userId, chatId, messageId);
  }

  async logAIResponse(response: string, userId?: string, chatId?: string, messageId?: string): Promise<void> {
    await this.info(`Ответ нейросети: ${response}`, undefined, userId, chatId, messageId);
  }

  async logImageProcessing(imageInfo: string, userId?: string, chatId?: string, messageId?: string): Promise<void> {
    await this.info(`Обработка изображения: ${imageInfo}`, undefined, userId, chatId, messageId);
  }

  async logLatexProcessing(formula: string, userId?: string, chatId?: string, messageId?: string): Promise<void> {
    await this.info(`Обработка LaTeX формулы: ${formula}`, undefined, userId, chatId, messageId);
  }

  // Метод для логирования ошибок без показа пользователю
  async logErrorSilently(message: string, error?: Error | any, userId?: string, chatId?: string, messageId?: string): Promise<void> {
    await this.error(message, error, userId, chatId, messageId);
  }
}

// Создаем глобальный экземпляр логгера
const defaultLogLevel = process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL) : LogLevel.INFO;
const defaultLogDir = process.env.LOG_DIR || 'logs';

export const logger = new Logger(defaultLogLevel, defaultLogDir);






