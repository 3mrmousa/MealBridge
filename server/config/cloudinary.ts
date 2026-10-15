import { v2 as cloudinary } from "cloudinary";

const isTest = process.env.NODE_ENV === "test";

if (
  !isTest &&
  (!process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET)
) {
  throw new Error("Missing Cloudinary environment variables");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "test_cloud",
  api_key: process.env.CLOUDINARY_API_KEY || "test_key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "test_secret",
});

export default cloudinary;
