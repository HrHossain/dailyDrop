import { Request, Response, NextFunction } from 'express';
import { uploadBufferToCloudinary } from '../../lib/cloudinary.helper.js';
import createHttpError from 'http-errors';
import { ApiResponse } from '../../utils/apiresponse.js';

export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const file = req.file;

  if (!file) {
    return next(createHttpError(400, 'Product image is required'));
  }
  const cloudinaryResponse: any = await uploadBufferToCloudinary(
    file.buffer,
    'dailyDrop-products-image'
  );

  // const product = await prisma.product.create({
  //     data: {
  //         name,
  //         price: Number(price),
  //         stock: Number(stock),
  //         image: cloudinaryResponse.secure_url, // ক্লাউডিনারি ইমেজ লিংক
  //     },
  // });

  if (!cloudinaryResponse) {
    return next(createHttpError(400, "Product image doesn't uploaded"));
  }

  return res.status(201).json(
    new ApiResponse({
      statusCode: 201,
      message: 'Product created with image successfully',
      data: cloudinaryResponse,
    })
  );
};
