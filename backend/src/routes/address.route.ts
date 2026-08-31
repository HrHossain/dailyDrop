import { Router } from "express";
import { getAddressById, getAllAddresses } from "../controllers/address/address.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

 const addressRouter = Router()

addressRouter.get("/",requireAuth,getAllAddresses)
addressRouter.get("/:id",requireAuth,getAddressById)
export default addressRouter