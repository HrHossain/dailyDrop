import { Request,Response,NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { ApiResponse } from "../../utils/apiresponse.js";
import { userLoginSchema } from "../../validations/loginSchema.js";


// POST : api/v1/partner/login
export const loginPartner = async (
  req: Request,
  res: Response,
  next: NextFunction
):Promise<void> => {
  
  const validatedInput = userLoginSchema.safeParse(req.body)
    if(!validatedInput.success){
        return next(createHttpError(400, 'Email and password are required'))
    }
    const { email, password } = validatedInput.data;
    const sanitizedEmail = email.toLowerCase().trim();

  const isUserExist = await prisma.deliveryPartner.findUnique({
    where: {
      email:sanitizedEmail,
    },
  });
  if (!isUserExist) {
    return next(createHttpError(401, 'Invalid email or password'));
  }

   if (!isUserExist.isActive) {
    return next(createHttpError(403, 'Your account has beendeactivated'));
  }

  const isPasswordValid = await bcrypt.compare(password, isUserExist.password);
  if (!isPasswordValid) {
    return next(createHttpError(401, 'Invalid Email or Password'));
  }
  const { password:_, ...deliveryPartner } = isUserExist;

  const accessToken = generateAccessToken(deliveryPartner.id,deliveryPartner.email);
  const refreshToken = generateRefreshToken(deliveryPartner.id,deliveryPartner.email);
  res
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    })
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 3,
    })
    .json(
      new ApiResponse({
        statusCode: 200,
        message: 'login successfully',
        data: deliveryPartner,
        meta: {
          accessToken,
          refreshToken,
        },
      })
    );
};

// get assigned deliveries
// GET /api/v1/my-deliveries

export const getMyDeliveries = async (
  req: Request,
  res: Response,
  next: NextFunction
):Promise<void> => {
    const partnerId = req.partner?.id;
    if (!partnerId) {
      return next(createHttpError(401, 'Unauthorized access. Partner not found.'));
    }
    const {status} = req.body;
    const where:any = {deliveryPartnerId:partnerId};
    if (status) {
      if (status === "active") {
        where.status = { in: ["Assigned", "Packed", "Out for Delivery"] };
      } else if (status === "completed") {
        where.status = { in: ["Delivered", "Cancelled"] };
      } else {
        return next(createHttpError(400, 'Invalid status filter provided'));
      }
    }

    const orders = await prisma.order.findMany({
        where,
        include:{user:{select:{name:true,email:true,phone:true}}},
        orderBy:{createdAt:"desc"}
    })

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: 'Deliveries fetched successfully',
        data: orders,
      })
    );

}