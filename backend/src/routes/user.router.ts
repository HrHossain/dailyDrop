import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { secureUser } from "../controllers/secure/me.controller.js";

const router = Router()

router.get("/me",requireAuth,secureUser)


export default router;