import { Request,Response,NextFunction } from "express";
import createHttpError from "http-errors";

export const requireRole = (role:"user"|"admin")=>{
    return (req:Request , res:Response , next:NextFunction)=>{
        const authReq = req as any;
        const user = authReq.user;
        if(!user){
            return next(createHttpError(401,'You are not auth user!'))
        }
        if(user.role !== role){
           return next(createHttpError(403,"This role does not allow here !")) 
        }

        next()
    }
}