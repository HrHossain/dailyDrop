import { Router } from "express";
import { getMyDeliveries, loginPartner } from "../controllers/delivery/delivery.controller.js";

const deliveryPartnerRouter = Router()

deliveryPartnerRouter.post('/login',loginPartner)
deliveryPartnerRouter.get('/my-deliveries',getMyDeliveries)
export default deliveryPartnerRouter