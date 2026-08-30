import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { httpLogger } from './middlewares/httpLogger.js';
import path from 'node:path';
import createError from 'http-errors';
import globalErrorHandler from './middlewares/globalErrorHandler.js';
import { prisma } from './lib/prisma.js';
import { ApiResponse } from './utils/apiresponse.js';
import authRouter from './routes/auth.router.js';
import secureRouter from './routes/user.router.js';
import adminRouter from './routes/admin.router.js';
import cookieParser from 'cookie-parser';
import productRouter from './routes/product.router.js';
import orderRouter from './routes/order.router.js';
import uploadRouter from './routes/upload.router.js';
import { inngest } from './config/inngest.js';
import { orderTriggeredStockCheck, scheduledStockCheck } from './functions-inngest/stockMonitor.js';
import { serve } from 'inngest/express';
const app = express();

app.use(helmet());
// app.use(cors({
//     origin: [
//         "https://mywebsite.com",
//         "https://admin.mywebsite.com"
//     ]
// }));
app.use(cookieParser());
app.use(cors());
app.use('/public', express.static(path.join(process.cwd(), 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(httpLogger);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json(
    new ApiResponse({
      message: 'Server is healthy',

      meta: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),

        database: prisma.$connect() ? 'Connected' : 'Disconnected',
        environment: process.env.NODE_ENV || 'development',
      },
    })
  );
});
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', secureRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);
app.use('api/v1/upload', uploadRouter);

// inngest setup

app.use('/api/v1/inngest', serve({
  client:inngest,
  functions: [scheduledStockCheck, orderTriggeredStockCheck],
}));
app.use((_req, _res, next) => {
  next(createError(404, 'Route not found!'));
});

app.use(globalErrorHandler);
export { app };


