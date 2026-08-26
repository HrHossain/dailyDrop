import { Router } from "express";
import { Request,Response,NextFunction } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { prisma } from "../lib/prisma.js";
import createHttpError from "http-errors";

const router = Router();

router.get("/users",requireAuth,requireRole('admin'),async(req:Request,res:Response,next:NextFunction)=>{
    const users = await prisma.users.findMany({
        orderBy:{
            timestamps:'desc'
        },
        select:{
            name:true,
            email:true,
            role:true,
            isEmailVerified:true,
            avatar:true
        }
    })

    if(!users){
        return next(createHttpError(404,'No user found with the given criteria'))
    }
    const filterUsers = users.map(u=>{
        return {name:u.name,email:u.email}
    })
    return res.status(200).json({
        message:"users found successfully",
        data:filterUsers
    })
})

export default router;