import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { validationError } from "./errorHandler";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."),
      false
    );
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const processImage = async (file, options = {}) => {
  try {
    const {
      width = 800,
      height = 800,
      quality = 80,
      format = "jpeg",
    } = options;

    const processedImage = await sharp(file.path)
      .resize(width, height, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFormat(format, { quality })
      .toBuffer();

    // Save the processed image
    await promisify(fs.writeFile)(file.path, processedImage);

    return {
      filename: file.filename,
      path: file.path,
      size: processedImage.length,
      mimetype: `image/${format}`,
    };
  } catch (error) {
    throw new Error("Error processing image: " + error.message);
  }
};

export const deleteFile = async (filePath) => {
  try {
    await promisify(fs.unlink)(filePath);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

export const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return next(validationError("No file uploaded"));
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return next(
      validationError("Invalid file type. Only JPEG, PNG and GIF are allowed.")
    );
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (req.file.size > maxSize) {
    return next(validationError("File size too large. Maximum size is 5MB."));
  }

  next();
};

export const generateThumbnail = async (file, size = 200) => {
  try {
    const thumbnailPath = path.join(
      path.dirname(file.path),
      `thumb-${file.filename}`
    );

    await sharp(file.path)
      .resize(size, size, {
        fit: "cover",
        position: "center",
      })
      .toFile(thumbnailPath);

    return {
      path: thumbnailPath,
      filename: `thumb-${file.filename}`,
    };
  } catch (error) {
    throw new Error("Error generating thumbnail: " + error.message);
  }
};

export const optimizeImage = async (file, options = {}) => {
  try {
    const { quality = 80, format = "jpeg" } = options;

    const optimizedImage = await sharp(file.path)
      .toFormat(format, { quality })
      .toBuffer();

    await promisify(fs.writeFile)(file.path, optimizedImage);

    return {
      filename: file.filename,
      path: file.path,
      size: optimizedImage.length,
      mimetype: `image/${format}`,
    };
  } catch (error) {
    throw new Error("Error optimizing image: " + error.message);
  }
};
