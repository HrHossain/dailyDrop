import { Router } from 'express';
import {
  forgotPassword,
  logoutHandler,
  refreshTokenHandler,
  registerUser,
  resetPassword,
} from '../controllers/auth/auth.controller.js';
import { loginUser } from '../controllers/auth/auth.controller.js';
import { verifyEmail } from '../controllers/auth/auth.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import {
  validateLoginRequest,
  validateRequest,
} from '../middlewares/userValidation.middleware.js';
import { userRegistrationSchema } from '../validations/registerSchema.js';
import { UserLoginInput, userLoginSchema } from '../validations/loginSchema.js';
import { checkAdmin } from '../middlewares/requireRole.js';
import { secureUser } from '../controllers/secure/me.controller.js';
const authRouter = Router();

authRouter
  .post('/register', validateRequest(userRegistrationSchema), registerUser)
  .post('/login', validateLoginRequest(userLoginSchema), loginUser);
authRouter.get('/verify-email', verifyEmail);
authRouter.post('/refresh-token', refreshTokenHandler);
authRouter.post('/logout', logoutHandler);
authRouter.post('/forgot-password', forgotPassword);
authRouter.put('/reset-password', resetPassword);
authRouter.post('/secure', requireAuth,checkAdmin,secureUser);
export default authRouter;
