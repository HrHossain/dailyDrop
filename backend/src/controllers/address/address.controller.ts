import { Request,Response,NextFunction } from "express"
import { verifyAccessToken } from "../../utils/jwt.js"
import { prisma } from "../../lib/prisma.js"
import createHttpError from "http-errors"
import { ApiResponse } from "../../utils/apiresponse.js";
import { AddressIdDTO, addressIdSchema, addressSchema, CreateAddressDTO } from "../../validations/address.validator.js";

/**
 * // GET : /api/v1/users/address/
 */
export const getAllAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    
    return next(createHttpError(401, 'Authentication token missing'));
  }

  const decoded = verifyAccessToken(accessToken) as { email?: string };

  if (!decoded?.email) {
    return next(createHttpError(401, 'Invalid or expired token'));
  }

  const existUser = await prisma.user.findUnique({
    where: { email: decoded.email },
    select: { id: true },
  });

  if (!existUser) {
    return next(createHttpError(401, 'User not authorized'));
  }

  const addresses = await prisma.address.findMany({
    where: { userId: existUser.id },
    orderBy: { createdAt: 'asc' },
  });

  let message='';
  if(addresses.length === 0 ){
    message = "You didn't add any addresses"
  }else{
    message = 'Addresses retrieved successfully'
  }

  res.status(200).json(new ApiResponse({
    statusCode:200,
    message,
    data:addresses,
    meta: {
          count: addresses.length,
        },
  
  }));
};


// GET : /api/v1/users/address/:id 
export const getAddressById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { accessToken } = req.cookies;

 
  if (!accessToken) {
    return next(createHttpError(401, 'Authentication token missing'));
  }

  
  const decoded = verifyAccessToken(accessToken) as { email?: string };

  if (!decoded?.email) {
    return next(createHttpError(401, 'Invalid or expired token'));
  }

  const existUser = await prisma.user.findFirst({
    where: { email: decoded.email },
    select: { id: true },
  });

  if (!existUser) {
    return next(createHttpError(401, 'User not authorized'));
  }

 
  const { id: addressId } = req.params;

  if (!addressId) {
    return next(createHttpError(400, 'Address ID is required in parameters'));
  }

 
  const address = await prisma.address.findFirst({
    where: {
      id: addressId as string,
      userId: existUser.id,
    },
  });

  if (!address) {
    return next(createHttpError(404, 'Address not found'));
  }

  let message = ''
  if(address){
    message = 'Address found successfull'
  }else{
    message = "Address didn't retrieves"
  }

  
  res.status(200).json(new ApiResponse(
    {
    statusCode:200,
    message,
    data:address
  }
  ));
};

// POST : /api/v1/users/address/ 
export const addAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { accessToken } = req.cookies;

  // 2. Validate token existence
  if (!accessToken) {
    return next(createHttpError(401, 'Authentication token missing'));
  }

  // 3. Decode and verify token
  const decoded = verifyAccessToken(accessToken) as { email?: string };

  if (!decoded?.email) {
    return next(createHttpError(401, 'Invalid or expired token'));
  }

  // 4. Find user and optimize with select
  const existUser = await prisma.user.findUnique({
    where: { email: decoded.email },
    select: { id: true },
  });

  if (!existUser) {
    return next(createHttpError(401, 'User not authorized'));
  }

  // 5. Validate request body using Zod
  const validationResult = addressSchema.safeParse(req.body);

  if (!validationResult.success) {
    return next(createHttpError(400,"data not given perfectly"));
  }

  const { label, address, city, state, zip, isDefault, lat, lng }:CreateAddressDTO = validationResult.data;
 let newAddress:CreateAddressDTO
  
  if (isDefault) {
    // If this address is set as default, unset any existing default addresses for this user first
    [_, newAddress] = await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId: existUser.id, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.address.create({
        data: {
          userId: existUser.id,
          label,
          address,
          city,
          state,
          zip,
          isDefault,
          lat,
          lng,
        },
      }),
    ]);
  } else {
    // Regular creation if it's not the default address
    newAddress = await prisma.address.create({
      data: {
        userId: existUser.id,
        label,
        address,
        city,
        state,
        zip,
        isDefault,
        lat,
        lng,
      },
    });
  }

 
  res.status(201).json(new ApiResponse({
    statusCode: 201,
    message: 'Address added successfully',
    data: newAddress,
  }));
};

// PUT : /api/v1/user/address/:id



export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { accessToken } = req.cookies;

  // 1. Validate token existence
  if (!accessToken) {
    return next(createHttpError(401, 'Authentication token missing'));
  }

  // 2. Decode and verify token
  const decoded = verifyAccessToken(accessToken) as { email?: string };

  if (!decoded?.email) {
    return next(createHttpError(401, 'Invalid or expired token'));
  }

  // 3. Find user and optimize with select
  const existUser = await prisma.user.findUnique({
    where: { email: decoded.email },
    select: { id: true },
  });

  if (!existUser) {
    return next(createHttpError(401, 'User not authorized'));
  }

  // 4. Extract address ID from route parameters
  const paramsValidation = addressIdSchema.safeParse(req.params);
  if (!paramsValidation.success) {
    return next(createHttpError(400, 'Invalid address ID provided in route parameters'));
  }

  const { id: addressId }: AddressIdDTO = paramsValidation.data;
  if (!addressId) {
    return next(createHttpError(400, 'Address ID is required in parameters'));
  }

  // 5. Verify ownership (IDOR Prevention) - Ensure address belongs to this user before updating
  const existingAddress = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: existUser.id,
    },
  });

  if (!existingAddress) {
    return next(createHttpError(404, 'Address not found'));
  }

  // 6. Validate request body using Zod
  const validationResult = updateAddressSchema.safeParse(req.body);

  if (!validationResult.success) {
    return next(createHttpError(400,"Validation error! please give correct data as input"));
  }

  const updateData = validationResult.data;
  let updatedAddress;

  // 7. Handle Default Address Logic via Transaction (if isDefault is being changed to true)
  if (updateData.isDefault === true) {
    const [_, result] = await prisma.$transaction([
      // Unset other default addresses for this user, excluding the current one
      prisma.address.updateMany({
        where: {
          userId: existUser.id,
          isDefault: true,
          id: { not: addressId },
        },
        data: { isDefault: false },
      }),
      // Update the target address
      prisma.address.update({
        where: { id: addressId },
        data: updateData,
      }),
    ]);
    updatedAddress = result;
  } else {
    // Regular update if isDefault is false or not being modified
    updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: updateData,
    });
  }

  res.status(200).json(new ApiResponse({
    statusCode: 200,
    message: 'Address updated successfully',
    data: updatedAddress,
  }));
};

// delete: /api/v1/user/address/:id

export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { accessToken } = req.cookies;

  // 1. Validate token existence
  if (!accessToken) {
    return next(createHttpError(401, 'Authentication token missing'));
  }

  // 2. Decode and verify token
  const decoded = verifyAccessToken(accessToken) as { email?: string };

  if (!decoded?.email) {
    return next(createHttpError(401, 'Invalid or expired token'));
  }

  // 3. Find user and optimize with select
  const existUser = await prisma.user.findUnique({
    where: { email: decoded.email },
    select: { id: true },
  });

  if (!existUser) {
    return next(createHttpError(401, 'User not authorized'));
  }

  // 4. Validate req.params using AddressIdDTO
  const paramsValidation = addressIdSchema.safeParse(req.params);

  if (!paramsValidation.success) {
    return next(createHttpError(400, 'Invalid address ID provided in route parameters'));
  }

  const { id: addressId }: AddressIdDTO = paramsValidation.data;

  // 5. Verify ownership (IDOR Prevention) - Ensure the address belongs to the user before deleting
  const existingAddress = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: existUser.id,
    },
  });

  if (!existingAddress) {
    return next(createHttpError(404, 'Address not found'));
  }

  // 6. Delete the address from the database
  await prisma.address.delete({
    where: { id: addressId },
  });

  res.status(200).json(new ApiResponse({
    statusCode: 200,
    message: 'Address deleted successfully',
    data:null
  
  }));
};