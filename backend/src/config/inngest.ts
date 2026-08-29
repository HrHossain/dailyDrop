// src/config/inngest.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'stock-alert-system',
  name: 'Stock Alert System',
  retryFunction: (attempt:any) => ({
    delay: Math.pow(2, attempt) * 1000,
    maxAttempts: 3,
  }),
});


export interface OrderPlacedEvent {
  name: 'order.placed';
  data: {
    orderId: number;
    userId: number;
    items: Array<{ productId: number; quantity: number }>;
  };
}

export interface StockCheckEvent {
  name: 'stock.check';
  data: {
    triggeredBy: 'order' | 'cron';
  };
}


export type InngestEvents = OrderPlacedEvent | StockCheckEvent;