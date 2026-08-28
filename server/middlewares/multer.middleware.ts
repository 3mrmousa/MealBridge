import multer from "multer";
import AppError from "../utils/errors/AppError.js";

const storage = multer.memoryStorage();

const allowedFileTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg",
  "image/svg+xml",
];

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Invalid file type", 400));
    }
  },
});

export const uploadSingleFileForPFP = upload.single("profilePicture");
export const uploadMultipleFilesForVerificationDocs = upload.fields([
  { name: "verificationDocument", maxCount: 5 },
]);
