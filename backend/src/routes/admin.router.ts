import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { admin } from '../middlewares/requireRole.js';
import { prisma } from '../lib/prisma.js';
import createHttpError from 'http-errors';
import { getStockHistory, getStockStatus, manualStockCheck, triggerHeartbeat, updateThreshold } from '../controllers/admin/admin.controller.js';

const router = Router();

// router.get(
//   '/users',
//   requireAuth,
//   admin,
//   async (req: Request, res: Response, next: NextFunction) => {
//     const users = await prisma.user.findMany({
//       orderBy: {
//         createdAt: 'desc',
//       },
//       select: {
//         name: true,
//         email: true,
//         avatar: true,
//       },
//     });

//     if (!users) {
//       return next(
//         createHttpError(404, 'No user found with the given criteria')
//       );
//     }
//     const filterUsers = users.map((u) => {
//       return { name: u.name, email: u.email };
//     });
//     return res.status(200).json({
//       message: 'users found successfully',
//       data: filterUsers,
//     });
//   }
// );

// only admin can access

router.get('/admin/stock/check', manualStockCheck);
router.get('/admin/stock/status', getStockStatus);
router.get('/admin/stock/history/:productId', getStockHistory);
router.post('/admin/stock/threshold', updateThreshold);
router.post('/admin/health/heartbeat', triggerHeartbeat);

export default router;
