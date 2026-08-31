import nodemailer from 'nodemailer';
import { env } from '../validations/env.schema.js';

interface StockAlert {
  productId: number;
  productName: string;
  stock: number;
  priority: 'critical' | 'warning';
}

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.GOOGLE_APP_EMAIL,
        pass: env.GOOGLE_APP_PASS,
      },
    });
  }

  async sendStockAlert(alerts: StockAlert[], recipients: string[]) {
    const criticalItems = alerts.filter((a) => a.priority === 'critical');
    const warningItems = alerts.filter((a) => a.priority === 'warning');

    const htmlContent = `
      <h2>🚨 Stock Alert Report</h2>
      <p>Dear Admin,</p>
      <p>Following products are running low on stock:</p>
      
      ${
        criticalItems.length > 0
          ? `
        <h3 style="color: red;">🔴 Critical (Stock <= 5)</h3>
        <table border="1" cellpadding="5">
          <tr><th>Product</th><th>Current Stock</th></tr>
          ${criticalItems
            .map(
              (item) => `
            <tr><td>${item.productName}</td><td style="color: red;">${item.stock}</td></tr>
          `
            )
            .join('')}
        </table>
      `
          : ''
      }

      ${
        warningItems.length > 0
          ? `
        <h3 style="color: orange;">🟡 Warning (Stock 6-10)</h3>
        <table border="1" cellpadding="5">
          <tr><th>Product</th><th>Current Stock</th></tr>
          ${warningItems
            .map(
              (item) => `
            <tr><td>${item.productName}</td><td style="color: orange;">${item.stock}</td></tr>
          `
            )
            .join('')}
        </table>
      `
          : ''
      }

      <p>
        <a href="${process.env.ADMIN_PANEL_URL}/restock" 
           style="background: #4CAF50; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px;">
          ⚡ Restock Now
        </a>
      </p>
      
      <p><small>This is an automated alert. Do not reply.</small></p>
    `;

    const mailOptions = {
      from: env.EMAIL_FROM,
      to: recipients.join(', '),
      subject: `🚨 Stock Alert: ${alerts.length} products need restock!`,
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error };
    }
  }

  async sendHeartbeat() {
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: env.ADMIN_EMAILS?.split(',') || [],
      subject: '✅ Stock Monitor is Alive',
      html: `
        <h2>System Health Check</h2>
        <p>Stock monitoring system is running perfectly.</p>
        <p>Last checked: ${new Date().toLocaleString()}</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
