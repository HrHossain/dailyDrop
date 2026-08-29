import { Request, Response, NextFunction } from 'express';
import { StockService } from '../../services/stock.service.js';
import { ApiResponse } from '../../utils/apiresponse.js';
import { prisma } from '../../lib/prisma.js';
import createHttpError from 'http-errors';
import { EmailService } from '../../services/stock.email.service.js';


const stockService = new StockService();


export const manualStockCheck = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const result = await stockService.checkAndAlert();
  if(!result){
    return createHttpError(500,'Manual stock check not completed')
  }
  res.status(200).json(new ApiResponse({
    statusCode:200,
    message:'Manual stock check completed',
    data:result,
    meta:{
        timestamp: new Date().toISOString()
    }
  }));
};


export const updateThreshold = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const { threshold, criticalThreshold, cooldownHours } = req.body;
  
  
  if (!threshold || !criticalThreshold || !cooldownHours) {
    return createHttpError(500,"Doesn't send threshold perfectly")
  }

  // এখানে ডেটাবেসে সেটিংস সেভ করতে পারেন
  // অথবা .env ফাইল আপডেট করতে পারেন
  
  res.status(200).json({
    success: true,
    message: 'Thresholds updated successfully',
    data: { threshold, criticalThreshold, cooldownHours },
  });
};

// ৩. সব প্রোডাক্টের স্টক স্ট্যাটাস (try-catch ছাড়া)
export const getStockStatus = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const products = await prisma.product.findMany({
    where: {
      stock: {
        lte: parseInt(process.env.STOCK_THRESHOLD || '10'),
      },
    },
    select: {
      id: true,
      name: true,
      stock: true,
      category: true,
      lastNotifiedAt: true,
    },
    orderBy: {
      stock: 'asc',
    },
  });

  return res.status(200).json({
    success: true,
    count: products.length,
    data: products,
    timestamp: new Date().toISOString(),
  });
};

// ৪. ইমেইল হেলথ চেক ট্রিগার (try-catch ছাড়া)
export const triggerHeartbeat = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  
  const emailService = new EmailService();
  
  await emailService.sendHeartbeat();
  
  res.status(200).json({
    success: true,
    message: 'Heartbeat email sent successfully',
    timestamp: new Date().toISOString(),
  });
};

// ৫. স্টক হিস্টোরি (try-catch ছাড়া)
export const getStockHistory = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const { productId } = req.params;
  
  const logs = await prisma.stockAlertLog.findMany({
    where: { productId },
    orderBy: { sentAt: 'desc' },
    take: 10,
  });

  res.status(200).json({
    success: true,
    data: logs,
  });
};