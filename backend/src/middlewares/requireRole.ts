import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { prisma } from '../lib/prisma.js';
import { env } from '../validations/env.schema.js';
import { ApiResponse } from '../utils/apiresponse.js';

export const admin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as any;
  const user = authReq.user;
  if (!user) {
    return next(createHttpError(401, 'You are not auth user!'));
  }

  const existUser = await prisma.user.findUnique({
    where: { email: user.email },
  });
  if (!existUser) {
    return next(createHttpError(404, 'User not found'));
  }

  const adminEmails = env.ADMIN_EMAILS
    ? env.ADMIN_EMAILS.split(',').map((email) => email.trim().toLowerCase())
    : [];

  if (adminEmails.includes(existUser.email.toLowerCase())) {
    if (req.user) {
      req.user.isAdmin = true;
      next();
    }
  } else {
    res.status(403).json(
      new ApiResponse({
        statusCode: 403,
        message: 'User not found',
        data: null,
      })
    );
  }
};
