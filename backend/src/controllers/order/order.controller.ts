import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { prisma } from "../../lib/prisma.js";
import { ApiResponse } from "../../utils/apiresponse.js";

interface FormattedOrderItem {
    product: string;
    name: string;
    image: string | null;
    price: number;
    quantity: number;
    unit: string | null;
}
export const createOrder = async (req: Request, res: Response,next:NextFunction) => {
    // 1. Security Check: Ensure user is authenticated
    const userId = req.user?.id;
    if (!userId) {
        return next(createHttpError(401, "Unauthorized: Please login to place an order"));
    }

    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return next(createHttpError(400, "No order items provided"));
    }

    // 2. Extract product IDs and fetch actual data from the database
    const productIds = items.map((item: any) => item.product);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
    });

    // 3. Create O(1) Lookup Map
    const productMap = new Map();
    products.forEach((p) => productMap.set(p.id, p));

    // 4. Validate stock and build order items safely using DB prices
    const orderItems:FormattedOrderItem[] = [];
    for (const item of items) {
        const dbProduct = productMap.get(item.product);

        if (!dbProduct) {
           return next(createHttpError(404, `Product not found: ${item.product}`));
        }

        if ((dbProduct.stock ?? 0) < item.quantity) {
            return next(createHttpError(400, `Insufficient stock for "${dbProduct.name}"`));
        }

        orderItems.push({
            product: dbProduct.id,
            name: dbProduct.name,
            image: dbProduct.image,
            price: dbProduct.price, // Uses real DB price, preventing client-side price tampering
            quantity: item.quantity,
            unit: dbProduct.unit,
        });
    }

    // 5. Accurate calculations
    const subTotal = orderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    
    // Fixed: Free delivery if subTotal >= 2000, else 150
    const deliveryFee = subTotal >= 2000 ? 0 : 150;
    const tax = Math.round(subTotal * 0.08 * 100) / 100;
    const total = Math.round((subTotal + deliveryFee + tax) * 100) / 100;

    // 6. Execute everything inside an Atomic Prisma Transaction 
    // (Ensures order creation and stock decrements happen together or roll back completely)
    const order = await prisma.$transaction(async (tx) => {
        // Create the order
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
                statusHistory: [{ status: "Placed", note: "Order placed successfully", titmestamp: new Date() }],
            },
        });

        // Decrement product stocks securely
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

    if (paymentMethod === "card") {
        // TODO: Handle Stripe payment link integration here
    }

    return res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            message: "Order created successfully",
            data: order,
        })
    );
};