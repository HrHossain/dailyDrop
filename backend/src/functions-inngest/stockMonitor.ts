import { inngest } from '../config/inngest.js';
import { logger } from '../lib/logger.js';
import { EmailService } from '../services/stock.email.service.js';
import { StockService } from '../services/stock.service.js';

const stockService = new StockService();

export const scheduledStockCheck = inngest.createFunction(
  {
    id: 'scheduled-stock-check',
    name: 'Scheduled Stock Check',
    retries: 3,
    triggers: { cron: '0 */6 * * *' },
  },
  async ({ event, step }) => {
    logger.info('⏰ Scheduled stock check started');

    const result = await step.run('check-stock', async () => {
      return await stockService.checkAndAlert();
    });

    // হেলথ চেক (দিনে ১ বার)
    if (new Date().getHours() === 6) {
      await step.run('send-heartbeat', async () => {
        const emailService = new EmailService();
        await emailService.sendHeartbeat();
      });
    }

    return {
      message: 'Stock check completed',
      result,
      timestamp: new Date().toISOString(),
    };
  }
);

// ২. ইভেন্ট-বেসড - অর্ডার প্লেসের পর
export const orderTriggeredStockCheck = inngest.createFunction(
  {
    id: 'order-triggered-stock-check',
    name: 'Order Triggered Stock Check',
    retries: 2,
    triggers: { event: 'order.placed' },
  },

  async ({ event, step }) => {
    const { orderId, items } = event.data;
    console.log(`🛒 Order ${orderId} triggered stock check`);

    await step.run('check-stock-after-order', async () => {
      const stockService = new StockService();
      await stockService.checkAfterOrder(items);
    });

    return {
      message: 'Post-order stock check completed',
      orderId,
      timestamp: new Date().toISOString(),
    };
  }
);
