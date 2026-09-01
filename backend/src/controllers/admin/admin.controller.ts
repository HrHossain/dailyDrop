import { Request, Response, NextFunction } from 'express';
import { StockService } from '../../services/stock.service.js';
import { ApiResponse } from '../../utils/apiresponse.js';
import { prisma } from '../../lib/prisma.js';
import createHttpError from 'http-errors';
import { EmailService } from '../../services/stock.email.service.js';
import { CreateDeliveryPartnerInput, createDeliveryPartnerSchema, DeliveryPartnerIdDTO, deliveryPartnerIdParamSchema, UpdateDeliveryPartnerInput, updateDeliveryPartnerSchema } from '../../validations/deliveryPartner.validation.js';
import { hashedPassword } from '../../lib/hash.js';
import { timeStamp } from 'node:console';


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

// update delivery data
export const updateDeliveryPartner = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // 1. Validate route parameter ID
  const paramsValidation = deliveryPartnerIdParamSchema.safeParse(req.params);

  if (!paramsValidation.success) {
    return next(createHttpError(400, 'Invalid delivery partner ID provided in parameters'));
  }

  const { id: partnerId }: DeliveryPartnerIdDTO = paramsValidation.data;

  // 2. Check if delivery partner exists
  const existingPartner = await prisma.deliveryPartner.findUnique({
    where: { id: partnerId },
    select: { id: true, email: true },
  });

  if (!existingPartner) {
    return next(createHttpError(404, 'Delivery partner not found'));
  }

  // 3. Validate request body with Zod
  const validationResult = updateDeliveryPartnerSchema.safeParse(req.body);

  if (!validationResult.success) {
   
    return next(createHttpError(400,"Wrong user credentials"));
  }

  const updateData: UpdateDeliveryPartnerInput = validationResult.data;

  
  if (updateData.email && updateData.email !== existingPartner.email) {
    const emailConflict = await prisma.deliveryPartner.findUnique({
      where: { email: updateData.email },
      select: { id: true },
    });

    if (emailConflict) {
      return next(createHttpError(409, 'Email is already in use by another delivery partner'));
    }
  }

  // 5. If password is being updated, hash it securely (handling Promise<string> cleanly via await)
  let hashedNewPassword: string | undefined = undefined;
  if (updateData.password) {
    const saltRounds = 10;
    hashedNewPassword = await hashedPassword(updateData.password)
  }

  // 6. Perform the update in the database
  const updatedPartner = await prisma.deliveryPartner.update({
    where: { id: partnerId },
    data: {
      ...updateData,
      ...(hashedNewPassword && { password: hashedNewPassword }),
    },
  });

  // 7. Strip password out for security
  const { password: _, ...partnerWithoutPassword } = updatedPartner;

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: 'Delivery partner profile updated successfully',
      data: {
        partner: partnerWithoutPassword,
      },
    })
  );
};

// assign delivery partner for order

export const assignDeliveryPartner = async (req:Request,res:Response,next:NextFunction) =>{
  const {parthnerId} = req.body;

  const order = await prisma.order.findUnique({
    where:{id:req.params.id as string}
  })

  const partner = await prisma.deliveryPartner.findUnique({
    where:{id:parthnerId}
  })
  const otp = String(Math.floor(100000 + Math.random() * 900000))

  let status = order?.status
  const history:any[] = Array.isArray(order?.statusHistory) ? order.statusHistory : [];
  if(order?.status === "Placed" || order?.status === "Confirmed"){
    status = "Assigned";
    history.push({
      status:"Assigned",
      note:`Assigned to ${partner?.name}`,
      timeStamp:new Date()
    })
  }

  await prisma.order.update({
    where:{id:order!.id},
    data:{deliveryPartnerId:partner!.id,
         deliveryOtp:otp,
         status,
         statusHistory:history
        }
  })
 res.status(200).json( new ApiResponse({
      statusCode: 200,
      message: 'Order assign to partner successfully',
      data: {
        order
      },
    })) 
}