import morgan, { type StreamOptions } from 'morgan'
import { logger } from '../lib/logger.js';


// Morgan-এর আউটপুট Winston HTTP লেভেলে রিডাইরেক্ট করা
const stream:StreamOptions = {
  write: (message:string) => logger.http(message.trim()),
};

// Development-এ সংক্ষেপ এবং Production-এ বিস্তারিত লগিন
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'development';
};

export const httpLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream }
);