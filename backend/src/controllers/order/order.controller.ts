import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { prisma } from '../../lib/prisma.js';
import { ApiResponse } from '../../utils/apiresponse.js';
import { inngest } from '../../config/inngest.js';

interface FormattedOrderItem {
  product: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  unit: string | null;
}
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  if (!userId) {
    return next(
      createHttpError(401, 'Unauthorized: Please login to place an order')
    );
  }

  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(createHttpError(400, 'No order items provided'));
  }

  const productIds = items.map((item: any) => item.product);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map();
  products.forEach((p) => productMap.set(p.id, p));

  const orderItems: FormattedOrderItem[] = [];
  for (const item of items) {
    const dbProduct = productMap.get(item.product);

    if (!dbProduct) {
      return next(createHttpError(404, `Product not found: ${item.product}`));
    }

    if ((dbProduct.stock ?? 0) < item.quantity) {
      return next(
        createHttpError(400, `Insufficient stock for "${dbProduct.name}"`)
      );
    }

    orderItems.push({
      product: dbProduct.id,
      name: dbProduct.name,
      image: dbProduct.image,
      price: dbProduct.price,
      quantity: item.quantity,
      unit: dbProduct.unit,
    });
  }

  const subTotal = orderItems.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = subTotal >= 2000 ? 0 : 150;
  const tax = Math.round(subTotal * 0.08 * 100) / 100;
  const total = Math.round((subTotal + deliveryFee + tax) * 100) / 100;

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        items: orderItems as any,
        shippingAddress,
        paymentMethod,
        subtotal: subTotal,
        deliveryFee,
        tax,
        total,
        statusHistory: [
          {
            status: 'Placed',
            note: 'Order placed successfully',
            titmestamp: new Date(),
          },
        ],
      },
    });

    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.product },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return newOrder;
  });

  // Inngest
  await inngest.send({
    name: 'order.placed',
    data: {
      orderId: order.id,
      userId: order.userId,
      items: orderItems.map((item) => ({
        productId: item.product,
        quantity: item.quantity,
      })),
    },
  });

  if (paymentMethod === 'card') {
    // TODO: Handle Stripe payment link integration here
  }

  res.status(201).json(
    new ApiResponse({
      statusCode: 201,
      message: 'Order created successfully',
      data: order,
    })
  );
};

//GET user's orders

// Define the expected query parameters type
interface GetUserOrdersQuery {
  status?: string;
}

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Safety check to ensure user is logged in
  const userId = req.user?.id;
  if (!userId) {
    throw createHttpError(401, 'Unauthorized: Please login');
  }

  const { status } = req.query;

  // 2. Build Prisma dynamic where clause safely
  const whereCondition: any = {
    userId,
    NOT: [
      {
        paymentMethod: 'card',
        isPaid: false,
      },
    ],
  };

  // 3. Apply status filter if provided and not "all"
  if (status && status !== 'all') {
    whereCondition.status = status;
  }

  // 4. Fetch orders from database
  const orders = await prisma.order.findMany({
    where: whereCondition,
    include: {
      deliveryPartner: {
        select: {
          name: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 5. Send successful response
  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: 'User orders fetched successfully',
      data: orders,
    })
  );
};

// GET single order

// GET /spi/orders/:id

export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.is as string, userId: req.user!.id },
    include: {
      deliveryPartner: {
        select: { name: true, phone: true, avatar: true, vehicleType: true },
      },
    },
  });
  if (!order) {
    return next(createHttpError(404, 'Order not found'));
  }
  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: 'your single order',
      data: order,
    })
  );
};

// Update order status (admin)
// PUT /api/orders/:id/status

interface StatusHistoryItem {
  status: string;
  note: string;
  timestamp: Date;
}

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status, note } = req.body;
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: id as string },
  });

  if (!order) {
    return next(createHttpError(404, 'Order not found'));
  }

  const existingHistory: any = Array.isArray(order.statusHistory)
    ? order.statusHistory
    : [];

  const newHistoryItem: StatusHistoryItem = {
    status,
    note: note || `Order marked as ${status.toLowerCase()}`,
    timestamp: new Date(),
  };

  const updatedHistory = [...existingHistory, newHistoryItem];

  const updatedOrder = await prisma.order.update({
    where: { id: id as string },
    data: {
      status,
      statusHistory: updatedHistory as any, // Prisma JSON field compatibility
    },
  });

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: 'Order status updated successfully',
      data: updatedOrder,
    })
  );
};

// GET all orders (admin)
// GET /api/orders/all

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orders = await prisma.order.findMany({
    where: { NOT: [{ paymentMethod: 'card', isPaid: false }] },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!orders) {
    return next(createHttpError(404, 'Orders not found'));
  }

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: 'All orders list here',
      data: orders,
    })
  );
};

// GET order location
// GET /api/v1/orders/:id/location

export const getOrderLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id as string,
      userId: req.user?.id,
    },
    select: { liveLocation: true, status: true },
  });

  if (!order) {
    return next(createHttpError(404, 'Order not found'));
  }
  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: 'All orders list here',
      data: {
        liveLocation: order.liveLocation,
        status: order.status,
      },
    })
  );
};
