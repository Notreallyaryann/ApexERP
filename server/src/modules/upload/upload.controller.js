import { uploadImage, isS3Configured } from '../../config/s3.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const uploadController = {
  async uploadProductImage(request, reply) {
    try {
      const data = await request.file();
      if (!data) {
        return errorResponse(reply, 'No file was uploaded.', 400);
      }

      const buffer = await data.toBuffer();
      const originalName = data.filename;
      const mimetype = data.mimetype;

      // Validate image mime type
      if (!mimetype.startsWith('image/')) {
        return errorResponse(reply, 'Only image files (JPEG, PNG, WebP) are allowed.', 400);
      }

      const imageUrl = await uploadImage(buffer, originalName, mimetype);

      return successResponse(
        reply,
        {
          imageUrl,
          storage: isS3Configured ? 'AWS_S3' : 'LOCAL_BASE64',
          filename: originalName,
        },
        'Image uploaded successfully.',
        201
      );
    } catch (err) {
      return errorResponse(reply, err.message, 500);
    }
  },
};
