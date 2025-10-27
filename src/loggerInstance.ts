import { Logger, LogLevel } from './logger';

// Создаем глобальный экземпляр логгера
const defaultLogLevel = process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL) : LogLevel.INFO;
const defaultLogDir = process.env.LOG_DIR || 'logs';

export const logger = new Logger(defaultLogLevel, defaultLogDir);