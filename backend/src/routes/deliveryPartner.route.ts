import { Router } from "express";
import { cancelDelivery, completeDelivery, getMyDeliveries, getMyDeliveryDetails, loginPartner, updateDeliveryStatus, updateLocation } from "../controllers/delivery/delivery.controller.js";
import { deliveryAuth } from "../middlewares/deliveryAuth.js";

const deliveryPartnerRouter = Router()

deliveryPartnerRouter.post('/login',loginPartner)
deliveryPartnerRouter.get('/my-deliveries',deliveryAuth , getMyDeliveries)
deliveryPartnerRouter.get('/my-deliveries/:id',deliveryAuth , getMyDeliveryDetails)
deliveryPartnerRouter.put('/my-deliveries/:id/complete',deliveryAuth ,completeDelivery)
deliveryPartnerRouter.put('/my-deliveries/:id/cancel',deliveryAuth , cancelDelivery)
deliveryPartnerRouter.put('/my-deliveries/:id/status',deliveryAuth , updateDeliveryStatus)
deliveryPartnerRouter.put('/my-deliveries/:id/location',deliveryAuth , updateLocation)
export default deliveryPartnerRouter