import {Request,Response,NextFunction} from 'express'
import createHttpError from 'http-errors';
import { jwt } from 'zod';
import { env } from '../validations/env.schema.js';
import { prisma } from '../lib/prisma.js';
export const deliveryAuth= async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if(!authHeader || !authHeader.startsWith("Bearer ")){
     return next(createHttpError(401,"No token provided"))
  }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token,env.JWT_SECRET as string) as {id:string,role:string}
  if(decoded.role !== "delivery"){
    return next(createHttpError(401,"Access denied.Delivery partner only"))
  }
  const partner = await prisma.deliveryPartner.findUnique({
    where:{id:decoded.id}
  })
  if(!partner || !partner.isActive){
     return next(createHttpError(403,"Account isdeactivated"))
  }
  req.partner = partner
  next()
}