import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';
import { AnyZodObject } from 'zod/v3';

export const validateRequest = (schema:AnyZodObject)=>{
    return async (req: Request, res: Response, next: NextFunction) => {
        const parsedBody = await schema.parseAsync(req.body)
        req.body = parsedBody
            logger.info(parsedBody)
        return next()
    }
}

export const validateLoginRequest = (schema:AnyZodObject)=>{
    return async (req: Request, res: Response, next: NextFunction) => {
        const parsedBody = await schema.parseAsync(req.body)
        req.body = parsedBody
        return next()
    }
}
