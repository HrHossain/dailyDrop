import winston from 'winston';
import 'winston-daily-rotate-file';

// লগের লেভেল নির্ধারণ (Development-এ debug, Production-এ info)
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// টার্মিনালে দেখানোর জন্য ফরম্যাট (Colorized + Readable)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}]: ${info.message}`
  )
);

// ফাইলে সেভ করার জন্য JSON ফরম্যাট
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// দৈনিক লগের ফাইল ট্রান্সপোর্ট (Daily Rotation)
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/%DATE%-combined.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true, // পুরনো ফাইলগুলো zip করে জায়গা বাঁচাবে
  maxSize: '20m', // সর্বোচ্চ ২০ মেগাবাইট হলে ফাইল স্প্লিট করবে
  maxFiles: '14d', // ১৪ দিন পর পুরনো লগ ফাইল ডিলিট করে দেবে
  format: fileFormat,
});

const errorFileRotateTransport = new winston.transports.DailyRotateFile({
  level: 'error',
  filename: 'logs/%DATE%-error.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: fileFormat,
});
export const logger = winston.createLogger({
  level,
  // format: winston.format.json(),
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    fileRotateTransport,
    errorFileRotateTransport,
  ],
});
