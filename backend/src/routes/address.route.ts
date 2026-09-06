import { Router } from "express";
import { addAddress, getAddressById, getAllAddresses,updateAddress,deleteAddress } from "../controllers/address/address.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

 const addressRouter = Router()

addressRouter.get("/",requireAuth,getAllAddresses)
addressRouter.get("/:id",requireAuth,getAddressById)
addressRouter.post("/",requireAuth,addAddress)
addressRouter.put("/:id",requireAuth,updateAddress)
addressRouter.delete("/:id",requireAuth,deleteAddress)
export default addressRouter