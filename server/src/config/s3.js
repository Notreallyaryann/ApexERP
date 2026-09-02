import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from './env.js';
import crypto from 'crypto';

let s3Client = null;
const isS3Configured = Boolean(
  env.AWS_ACCESS_KEY_ID &&
  env.AWS_SECRET_ACCESS_KEY &&
  env.AWS_S3_BUCKET_NAME
);

if (isS3Configured) {
  s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
  console.log('⚡ AWS S3 Client initialized.');
} else {
  console.log('ℹ️ AWS S3 credentials not fully set. Using smart image storage fallback.');
}

/**
 * Uploads a file buffer to S3 or returns a data URL/fallback URL
 * @param {Buffer} fileBuffer
 * @param {string} originalName
 * @param {string} mimeType
 * @returns {Promise<string>} Uploaded public URL
 */
export async function uploadImage(fileBuffer, originalName, mimeType) {
  const extension = originalName ? originalName.split('.').pop() : 'jpg';
  const fileName = `products/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`;

  if (isS3Configured && s3Client) {
    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimeType || 'image/jpeg',
    });

    await s3Client.send(command);
    return `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`;
  }

  // Fallback: Data URL or simulated cloud storage for demo
  const base64Data = fileBuffer.toString('base64');
  return `data:${mimeType || 'image/jpeg'};base64,${base64Data}`;
}

export { s3Client, isS3Configured };
