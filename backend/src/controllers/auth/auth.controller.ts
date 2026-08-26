 import type { Request, Response, NextFunction } from "express";
import registerSchema from "../../validations/registerSchema.js";
import { prisma } from "../../lib/prisma.js";
import createError from "http-errors";
import { ApiResponse } from "../../utils/apiresponse.js";
import { hashedPassword } from "../../lib/hash.js";
import { sendVerificationEmail } from "../../services/auth.service.js";
import createHttpError from "http-errors";
import { verifyEmailVerificationToken, verifyRefreshToken } from "../../utils/jwt.js";
import loginSchema from "../../validations/loginSchema.js";
import bcrypt from "bcryptjs";
import { generateAccessToken } from "../../utils/jwt.js";
import {generateRefreshToken} from "../../utils/jwt.js";
import { logger } from "../../lib/logger.js";
import {z} from "zod";
import crypto from 'crypto'
import {sendPasswordResetEmail} from "../../services/auth.service.js"


 export const signup = async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const result = registerSchema.safeParse(body);
    if (!result.success) {
        return next(result.error);
    }   

    
    const isEmailExist = await prisma.users.findUnique({
        where: {
            email: result.data.email,
        },
    });
    if (isEmailExist) {
        return next(createError(400, "Email already exists"));
    }

    const newUser = await prisma.users.create({
        data: {
            ...result.data,
            password: await hashedPassword(result.data.password),
        },
    })

    const { password, ...user } = newUser;
    await sendVerificationEmail(user.id , user.name , user.email);
    return res.json(
        new ApiResponse({
            statusCode: 201,
            message: "User registered successfully",
            data: user,
        })
    )
}

export const signin = async(req: Request, res: Response, next: NextFunction)=>{
    
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return next(result.error);
    }

    const isUserExist = await prisma.users.findUnique({
        where: {
            email: result.data.email,    
    },
    });
    if(!isUserExist){
        return next(createError(400, "User not found"));
    }
     
    const isPasswordValid = await bcrypt.compare(result.data.password, isUserExist.password);
    if(!isPasswordValid){
        return next(createError(401, "Invalid Email or Password"));
    }
    const {password, ...user} = isUserExist;

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);
    return res.
    cookie('accessToken',accessToken,{
        httpOnly:true,
        secure:true,
        sameSite:'strict',
        maxAge: 1000 * 60 * 60 * 24,
    }).
    cookie('refreshToken',refreshToken,{
        httpOnly:true,
        secure:true,
        sameSite:'strict',
        maxAge: 1000 * 60 * 60 * 24*3,
    })
    .json(
        new ApiResponse({
            statusCode: 200,
            message: 'login successfully',
            data:user,
            meta:{
                accessToken,
                refreshToken
            }
        })
    )
}

export const verifyEmail = async(req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query;
    if(!token || typeof token !== 'string') {
        return next(createHttpError(400, 'Token is required'));
    }
    const payload = verifyEmailVerificationToken(token);
    
    const isUserExist = await prisma.users.findUnique({
        where: {
            id: payload.userId,
        },
    });
    if (!isUserExist) {
        return next(createHttpError(404, 'User not found'));
    }

    if (isUserExist.emailVerification) {
    return next(createHttpError(400, 'email already verified.'));
  }
    // Update user's email verification status
    await prisma.users.update({
        where: {
            id: payload.userId,
        },
        data: {
            isEmailVerified: true,
        },
    });
    return res.json(new ApiResponse({
        statusCode: 200,
        message: 'Email verified successfully',
    }));
}

export const refreshTokenHandler = async(req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.refreshToken as string | undefined
    logger.info(req.cookies)
    if(!token){
        return next(createHttpError('401','refresh token missing'))
    }
    
       const payload = verifyRefreshToken(token)
       if(!payload){
        return next(createHttpError('401','refresh token payload missing'))
       }
       const { userId , email } = payload
       const user = await prisma.users.findUnique({
        where:{
            email
        }
       })
     const newAccessToken = generateAccessToken(userId,email)
        res.cookie('accessToken',newAccessToken,{
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        })

    return res.status(200).json(new ApiResponse({
        message:'new token generated successfully',
        data:user
    }))
}

export const logoutHandler = async (_req: Request, res: Response, _next: NextFunction)=> {
    const cookieOptions:{httpOnly:boolean,secure:boolean,sameSite:'strict'|'lax'|boolean} = {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        };
    res.clearCookie('accessToken',cookieOptions)
    res.clearCookie('refreshToken',cookieOptions)
    return res.status(200).json(new ApiResponse({
        message:"Logged out"
    }))
}

export const forgotPassword = async (req: Request, res: Response,next: NextFunction)=> {
    const emailVerify = z.object({
        email:z.string().email({ message: "Invalid email address" }).trim().toLowerCase()
    })

    const result = emailVerify.safeParse(req.body)
    if(!result.success){
        return next(createError('401','Invalid your email address'))
    }

    const user = await prisma.users.findUnique({
        where:{
            email:result.data.email
        }
    })
    if(!user){
        return next(createError(400,'Please put your valid Email'))
    }
    const resetToken:string = crypto.randomBytes(32).toString("hex");
    const hashedToken:string = crypto.createHash('sha256').update(resetToken).digest("hex")
    const expiresAt:Date = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.users.update({
        where:{email:user.email},
        data:{
            resetPasswordToken:hashedToken,
            restPasswordTokenExpiry:expiresAt
        }
    })

    sendPasswordResetEmail(user.id,user.name,user.email,resetToken)
    return res.status(200).json(new ApiResponse({
        message:"If an account exists for this email, a reset link has been sent."
    }))
}

export const resetPassword = async (req: Request, res: Response,next: NextFunction)=>{
     const  {token}  = req.query;
     if(!token || typeof token !== 'string') {
        return next(createHttpError(400, 'Token is required'));
    }
    const { password , confirmPassword } = req.body
     if(password.length < 6){
            return next(createError(400,'Password length must be 6'))
        }
    if(!password || !confirmPassword){
        return next(createError(400,'set new password'))
    }
    if(password !== confirmPassword){
       
        return next(createError(400,'Confirm password does not match'))
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest("hex")

    const user = await prisma.users.findFirst({
        where:{
            resetPasswordToken:hashedToken,
            restPasswordTokenExpiry:{
                gt:new Date()
            }
        }
    })

    if(!user){
        return next(createError(400,"Your Token has been expired"))
    }

    const hashedPass = await hashedPassword(password)
    await prisma.users.update({
        where:{id:user.id},
        data:{
            password:hashedPass,
            resetPasswordToken:null,
            restPasswordTokenExpiry:null
        }
    })

    return res.status(200).json(new ApiResponse({message:"Your password has been changed successfull . Go to Log in"}))
}