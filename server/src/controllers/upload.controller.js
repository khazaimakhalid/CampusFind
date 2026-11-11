
import { cloudinary } from '../utils/cloudinary.js';
import { ApiError } from '../utils/apiErrors.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please select an image.');
  }

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'campusfind'
      },
      (error, uploadedImage) => {
        if (error) {
          reject(error);
        } else {
          resolve(uploadedImage);
        }
      }
    );

    uploadStream.end(req.file.buffer);
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { imageUrl: result.secure_url },
      'Image uploaded successfully'
    )
  );
});

export { uploadImage };
