import { createLogger, format, transports } from 'winston';
import * as path from 'path';
import * as fs from 'fs';

// custom log display format
const customFormat = format.printf(({ timestamp, level, stack, message }) => {
  return `${timestamp} - [${level.toUpperCase().padEnd(7)}] - ${stack || message}`;
});

// Tạo thư mục logs nếu chưa tồn tại
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const options = {
  error: {
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
  },
  info: {
    filename: path.join(logsDir, 'combined.log'),
    level: 'info',
  },
};

// for development environment
const devLogger = {
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    customFormat,
  ),
  transports: [
    new transports.Console(),
    new transports.File(options.error),
    new transports.File(options.info),
  ],
};

// for production environment
const prodLogger = {
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [
    new transports.File(options.error),
    new transports.File(options.info),
  ],
};

// export log instance based on the current environment
const instanceLogger =
  process.env.NODE_ENV === 'production' ? prodLogger : devLogger;

export const instance = createLogger(instanceLogger);
