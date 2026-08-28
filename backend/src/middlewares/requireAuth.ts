import { Request,Response,NextFunction } from "express";
import createHttpError from "http-errors";
import { verifyAccessToken } from "../utils/jwt.js";
import { prisma } from "../lib/prisma.js";

export const requireAuth = async (req:Request,res:Response,next:NextFunction)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return next(createHttpError(401,'You are not auth user! '))
    }
    const token = authHeader.split(' ')[1]
    const user = verifyAccessToken(token)
    if(!user){
        return next(createHttpError(401,'You are not auth user!'))
    }
    const {userId} = user
    const foundUser = await prisma.user.findFirst({
        where:{
            id:userId
        }
    })
    if(!foundUser){
         return next(createHttpError(401,'user not found !'))
    }
    const authReq = req as any;
    authReq.user = {
        id:foundUser.id,
        email:foundUser.email,
        name:foundUser.name,
        isAdmin:false
    }
    next()
}