import { v2 as cloudinary } from 'cloudinary';

let configured = false;

export function hasCloudinary() {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export function ensureCloudinary() {
  if (!configured && hasCloudinary()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    configured = true;
  }
  return hasCloudinary();
}

export default cloudinary;
