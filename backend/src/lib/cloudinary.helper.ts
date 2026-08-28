import cloudinary from '../config/cloudinary.config.js';

export const uploadBufferToCloudinary = (
  fileBuffer: Buffer,
  folderName: string = 'ecommerce_products'
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};
