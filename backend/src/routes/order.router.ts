import { Router } from "express";
import { createOrder, getAllOrders, getOrder, getOrderLocation, getUserOrders, updateOrderStatus } from "../controllers/order/order.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { admin } from "../middlewares/requireRole.js";


const orderRouter = Router();

orderRouter.post("/",requireAuth,createOrder)
            .get("/",requireAuth,getUserOrders)
            .get('/all',requireAuth,admin,getAllOrders)
            .get('/:id',requireAuth,getOrder)
            .put('/:id/status',requireAuth,admin,updateOrderStatus)
            .get("/:id/location",requireAuth,getOrderLocation)

export default orderRouter