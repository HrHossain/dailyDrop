import * as z from 'zod';
import { logger } from '../lib/logger.js';
import dotenv from 'dotenv';
dotenv.config();
const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z
    .string()
    .url({ message: 'DATABASE_URL must be a valid URL' })
    .optional(),
  JWT_SECRET: z
    .string()
    .min(32, { message: 'JWT_SECRET must be at least 32 characters long' }),
  GOOGLE_APP_PASS: z.string().min(10, {
    message: 'GOOGLE_APP_PASS must be at least 32 characters long',
  }),
  EMAIL_FROM: z
    .string()
    .email({ message: 'APP_EMAIL must be a valid email address' }),
  GOOGLE_APP_EMAIL: z
    .string()
    .email({ message: 'GOOGLE_APP_EMAIL must be a valid email address' }),
  APP_URL: z
    .string()
    .url({ message: 'APP_URL must be a valid URL' })
    .optional(),
  ADMIN_EMAILS: z.string({ message: 'admin have must valid email' }),
  CLOUDINARY_CLOUD_NAME: z.string({
    message: 'cloudinary cloud name must be string',
  }),
  CLOUDINARY_API_KEY: z.string({
    message: 'cloudinary api key must be string',
  }),
  CLOUDINARY_API_SECRET: z.string({
    message: 'cloudinary api secret name must be string',
  }),
  INNGEST_EVENT_KEY: z.string({
    message: 'Inngest event name must be string',
  }),
  INNGEST_SIGNING_KEY: z.string({
    message: 'Inngest api key must be string',
  }),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  const formattedErrors = _env.error.flatten().fieldErrors;
  logger.info('❌ Invalid environment variables:');
  logger.error(JSON.stringify(formattedErrors, null, 2));
  process.exit(1);
}

// 🟢 সম্পূর্ণ টাইপ-সেফ পার্স করা ডাটা Export
export const env = _env.data;

// TypeScript Type Definition Export
export type Env = z.infer<typeof envSchema>;
