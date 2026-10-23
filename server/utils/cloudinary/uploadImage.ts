import type { UploadApiResponse } from "cloudinary";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadPFPToCloudinary = (
  fileBuffer: Buffer,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "MealBridge/ProfilePictures",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error);
        }
        resolve(result);
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const uploadVerificationDocsToCloudinary = (
  fileBuffer: Buffer,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "MealBridge/VerificationDocuments",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error);
        }
        resolve(result);
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const uploadDonationPicsToCloudinary = (
  fileBuffer: Buffer,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "MealBridge/DonationPictures",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error);
        }
        resolve(result);
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const uploadSiteSettingsLogoToCloudinary = (
  fileBuffer: Buffer,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "MealBridge/SiteSettingsLogo",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error);
        }
        resolve(result);
      },
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const uploadSiteSettingsFaviconToCloudinary = (
  fileBuffer: Buffer,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "MealBridge/SiteSettingsFavicon",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error);
        }
        resolve(result);
      },
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};
