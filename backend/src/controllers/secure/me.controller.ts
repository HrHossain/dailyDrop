import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/apiresponse.js";
import createHttpError from "http-errors";
export const secureUser = async (req:Request,res:Response,next:NextFunction)=>{
    const authReq = req as any;
    const user = authReq.user
    if(!user){
        return next(createHttpError('400','User not found'))
    }

    return res.status(200).json(new ApiResponse({message:"user profile successfully found",data:user}))
}