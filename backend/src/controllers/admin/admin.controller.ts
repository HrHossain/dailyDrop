import { Request, Response, NextFunction } from 'express';
import { StockService } from '../../services/stock.service.js';
import { ApiResponse } from '../../utils/apiresponse.js';
import { prisma } from '../../lib/prisma.js';
import createHttpError from 'http-errors';
import { EmailService } from '../../services/stock.email.service.js';
import { CreateDeliveryPartnerInput, createDeliveryPartnerSchema } from '../../validations/deliveryPartner.validation.js';
import { hashedPassword } from '../../lib/hash.js';
import { string } from 'zod';

const stockService = new StockService();

export const manualStockCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await stockService.checkAndAlert();
  if (!result) {
    return createHttpError(500, 'Manual stock check not completed');
  }
  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: 'Manual stock check completed',
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
      },
    })
  );
};

export const updateThreshold = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { threshold, criticalThreshold, cooldownHours } = req.body;

  if (!threshold || !criticalThreshold || !cooldownHours) {
    return createHttpError(500, "Doesn't send threshold perfectly");
  }

  // এখানে ডেটাবেসে সেটিংস সেভ করতে পারেন
  // অথবা .env ফাইল আপডেট করতে পারেন

  res.status(200).json({
    success: true,
    message: 'Thresholds updated successfully',
    data: { threshold, criticalThreshold, cooldownHours },
  });
};


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

// get admin dashboard data

export const getAdminStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const [totalOrders,totalUsers,totalProducts,outOfStock,totalPartners,recentOrders] = await Promise.all([
    prisma.order.count({where:{NOT:{paymentMethod:"card",isPaid:false}}}),
    prisma.user.count(),
    prisma.product.count(),
    prisma.product.count({where:{stock:0}}),
    prisma.deliveryPartner.count(),
    prisma.order.findMany({
      where:{NOT:{paymentMethod:"card",isPaid:false}},
      orderBy:{createdAt:"desc"},
      take:10,
      include:{
        user:{select:{name:true,email:true}},
        deliveryPartner:{select:{name:true,phone:true,email:true}}
      }
    })
  ])

  res.status(200).json(new ApiResponse({
    statusCode:200,
    message:"Dashboad all stats retrive successfully",
    data:{
      totalOrders,totalUsers,totalProducts,outOfStock,totalPartners,recentOrders
    }

  }))
}

// get delivery partners list for admin

export const getDeliveryPartners = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  const partners = await prisma.deliveryPartner.findMany({
    orderBy:{createdAt:"desc"}
  })
  res.status(200).json(new ApiResponse({
    statusCode:200,
    message:"All delivery partners retrive successfully",
    data:{
      partners
    }

  }))
}

// create delivery partner profile

export const createDeliveryPartners = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // 1. Validate request body using Zod
  const validationResult = createDeliveryPartnerSchema.safeParse(req.body);

  if (!validationResult.success) {
    return next(createHttpError(400,"User credential wrong!"));
  }

  const { name, email, password, phone, avatar, vehicleType, isActive }: CreateDeliveryPartnerInput = validationResult.data;

  // 2. Check if delivery partner with this email already exists
  const existingPartner = await prisma.deliveryPartner.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingPartner) {
    return next(createHttpError(409, 'Delivery partner with this email already exists'));
  }

  
  const hashedPass:string = await hashedPassword(password)

  // 4. Create new delivery partner in database
  const newPartner = await prisma.deliveryPartner.create({
    data: {
      name,
      email,
      password: hashedPass,
      phone,
      avatar,
      vehicleType,
      isActive,
    },
  });

  // 5. Exclude password from the returned object for security
  const { password: _, ...partnerWithoutPassword } = newPartner;

  res.status(201).json(
    new ApiResponse({
      statusCode: 201,
      message: 'Created delivery partner profile successfully',
      data: {
        partner: partnerWithoutPassword,
      },
    })
  );
};