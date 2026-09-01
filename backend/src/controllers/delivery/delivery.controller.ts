import { Request,Response,NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import { ApiResponse } from "../../utils/apiresponse.js";
import { userLoginSchema } from "../../validations/loginSchema.js";
import { jwt } from "zod";
import { env } from "../../validations/env.schema.js";

// token

const generateToken = (id:string)=>{
    return jwt.sign({id,role:"delivery"},env.JWT_SECRET as string,{expiresIn:"30d"})
}
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

  const token = generateToken(deliveryPartner.id);

  res
    .cookie('accessToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    }).json(
      new ApiResponse({
        statusCode: 200,
        message: 'login successfully',
        data: deliveryPartner,
        meta: {
          token
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

// GET single delivery detail
// GET /api/delivery/my-deliveries/:id
export const getMyDeliveryDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
):Promise<void> => {
    const {id} = req.params
    const order = await prisma.order.findFirst({
        where:{id:id as string,deliveryPartnerId:req.partner!.id},
        include:{
            user:{
                select:{
                name:true,
                email:true,
                phone:true
            }}
        }
    })

    if(!order){
        return next(createHttpError(404,"Delivery not found"))
    }
    res.status(200).json(new ApiResponse({
        statusCode:200,
        message:"Found delivery order successfully",
        data:order
    }))
}

// complete delivery with OTP
// PUT /api/v1/delivery/my-deliveries/:id/complete
export const completeDelivery = async(
  req: Request,
  res: Response,
  next: NextFunction
):Promise<void> => {
    const {otp} = req.body;
    const order = await prisma.order.findFirst({
        where:{id:req.params.id as string,
            deliveryPartnerId:req.partner!.id},
    })

    if(!order || order.status ==="Cancelled" || order.status ==="Delivered"){
        return next(createHttpError(400,"Invalid Request"))
    }

    if(order.deliveryOtp !== otp){
        return next(createHttpError(400,"Invalid OTP"))
    }

    const history = order?.statusHistory as any[]
     history.push({status:"Delivered",
        note:"Delivered by partner",
        timestamp:new Date()})
    
    const updatedOrder = await prisma.order.update({
        where:{id:order.id},
        data:{status:"Delivered",
            statusHistory:history,
            deliveryOtp:""}
    })
    res.status(200).json(new ApiResponse({
        statusCode:200,
        message:"Delivery updated successfully",
        data:updatedOrder
    }))
}


// cancel delivery
// PUT  /api/v1/delivery/my-deliveries/:id/cancel

export const cancelDelivery = async(
  req: Request,
  res: Response,
  next: NextFunction
):Promise<void> => {
    const {otp} = req.body;
    const order = await prisma.order.findFirst({
        where:{id:req.params.id as string,
            deliveryPartnerId:req.partner!.id},
    })
    if(order!.status === "Delivery"){
        return next(createHttpError(400,"You cannot cancel a delivered order"))
    }

    const history = order!.statusHistory as any[]
     history.push({status:"Cancelled",
        note: "You cancelled the order",
        timestamp:new Date()})

    const updatedOrder = await prisma.order.update({
        where:{id:order!.id},
        data:{status:"Cancelled",statusHistory:history}
    })
    res.status(200).json(new ApiResponse({
        statusCode:200,
        message:"Delivery cancelled",
        data:updatedOrder
    }))
}

// update order status
// PUT /api/v1/delivery/my-delivery/:id/status

export const updateDeliveryStatus = async(
  req: Request,
  res: Response,
  next: NextFunction
):Promise<void> => {
    const {status} = req.body
    const allowedStatuses = ["Packed","Out for Delivery"]
    if(!allowedStatuses.includes(status)){
        return next(createHttpError(400,"Invalid status update"))
    }

    const order = await prisma.order.findFirst({
        where:{id:req.params.id as string,
            deliveryPartnerId:req.partner!.id
        }
    })

     const history = order?.statusHistory as any[]
     history.push({status,
        note:`Status updated to ${status}`,
        timestamp:new Date()})
    
    const updatedOrder = await prisma.order.update({
        where:{id:order!.id},
        data:{status,statusHistory:history}
    })

     res.status(200).json(new ApiResponse({
        statusCode:200,
        message:"Update delivery status successfully",
        data:updatedOrder
    }))
}

// update live location
// PUT /api/v1/delivery/my-delivery/:id/location

export const updateLocation = async(
  req: Request,
  res: Response,
  next: NextFunction
):Promise<void> => {
    const {lat,lng} = req.body
    

    const order = await prisma.order.findFirst({
        where:{id:req.params.id as string,
            deliveryPartnerId:req.partner!.id,
            status:{in:["Assigned","Packed","Out for Delivery"]}
        }
    })

    
    await prisma.order.update({
        where:{id:order!.id},
        data:{liveLocation:{lat,lng,updatedAt:new Date()}}
    })

     res.status(200).json(new ApiResponse({
        statusCode:200,
        message:"Updated livelocation",
        data:null
    }))
}