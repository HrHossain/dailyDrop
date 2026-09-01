import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { admin } from '../middlewares/requireRole.js';
import { prisma } from '../lib/prisma.js';
import createHttpError from 'http-errors';
import {
  assignDeliveryPartner,
  createDeliveryPartners,
  getAdminStats,
  getDeliveryPartners,
  getStockHistory,
  getStockStatus,
  manualStockCheck,
  triggerHeartbeat,
  updateDeliveryPartner,
  updateThreshold,
} from '../controllers/admin/admin.controller.js';

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

router.get('/stock/check', manualStockCheck);
router.get('/stock/status', getStockStatus);
router.get('/stock/history/:productId', getStockHistory);
router.post('/stock/threshold', updateThreshold);
router.post('/health/heartbeat', triggerHeartbeat);
router.get("/stats",requireAuth,admin,getAdminStats)
router.get("/delivery-partners",requireAuth,admin,getDeliveryPartners)
router.get("/delivery-partners",requireAuth,admin,createDeliveryPartners)
router.get("/delivery-partners/:id",requireAuth,admin,updateDeliveryPartner)
router.get("/orders/:id/assign",requireAuth,admin,assignDeliveryPartner)

export default router;
