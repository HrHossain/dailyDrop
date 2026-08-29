
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';
import { env } from '../validations/env.schema.js';
import { EmailService } from './stock.email.service.js';


const emailService = new EmailService();

export class StockService {
  
  private readonly THRESHOLD = parseInt(process.env.STOCK_THRESHOLD || '10');
  private readonly CRITICAL_THRESHOLD = parseInt(process.env.CRITICAL_THRESHOLD || '5');
  private readonly COOLDOWN_HOURS = parseInt(process.env.ALERT_COOLDOWN_HOURS || '24');

  async checkAndAlert() {
    console.log('🔍 Running stock check...');

    
    const products = await prisma.product.findMany({
      where: {
        stock: {
          lte: this.THRESHOLD, 
        },
        OR: [
          { lastNotifiedAt: null }, 
          {
            lastNotifiedAt: {
              lt: new Date(Date.now() - this.COOLDOWN_HOURS * 60 * 60 * 1000),
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        stock: true,
        lastNotifiedAt: true,
      },
    });

    if (products.length === 0) {
      return { alerted: false, count: 0 };
    }

    
    const alerts = products.map(product => ({
      productId: product.id,
      productName: product.name,
      stock: product.stock,
      priority: product.stock <= this.CRITICAL_THRESHOLD ? 'critical' : 'warning',
    }));

    
    const criticalProducts = alerts.filter(a => a.priority === 'critical');
    if (criticalProducts.length > 0) {
      console.log(`⚠️ ${criticalProducts.length} critical products found! Sending immediate alert.`);
    }

    
    const recipients = env.ADMIN_EMAILS?.split(',') || [];
    const emailResult = await emailService.sendStockAlert(alerts, recipients);

    
    for (const alert of alerts) {
      await prisma.stockAlertLogs.create({
        data: {
          productId: alert.productId,
          productName: alert.productName,
          stockAtAlert: alert.stock,
          recipientEmail: recipients.join(', '),
          status: emailResult.success ? 'SUCCESS' : 'FAILED',
          errorMessage: emailResult.success ? null : emailResult.error?.message,
        },
      });
    }

    
    if (emailResult.success) {
      await prisma.product.updateMany({
        where: {
          id: {
            in: products.map(p => p.id),
          },
        },
        data: {
          lastNotifiedAt: new Date(),
        },
      });
      logger.info(`✅ Alert sent for ${products.length} products.`);
    } else {
      logger.info('❌ Email failed, logs saved for retry.');
    }

    return {
      alerted: emailResult.success,
      count: products.length,
      criticalCount: criticalProducts.length,
    };
  }

  
  async checkAfterOrder(orderItems: Array<{ productId: number; quantity: number }>) {
    const productIds = orderItems.map(item => item.productId);
    
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds},
        stock: { lte: this.THRESHOLD },
      },
    });

    if (products.length > 0) {
      await this.checkAndAlert();
    }
  }
}