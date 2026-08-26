import {Router} from "express";
import {forgotPassword, logoutHandler, refreshTokenHandler, resetPassword, signup } from "../controllers/auth/auth.controller.js";
import { signin } from "../controllers/auth/auth.controller.js";
import { verifyEmail } from "../controllers/auth/auth.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
const authRouter = Router();

authRouter.post("/signup", signup).post("/signin", signin);
authRouter.get('/verify-email',verifyEmail );
authRouter.post("/refresh-token",refreshTokenHandler)
authRouter.post("/logout",logoutHandler)
authRouter.post('/forgot-password',forgotPassword)
authRouter.put("/reset-password",resetPassword)
authRouter.post("/secure",requireAuth)
export default authRouter;