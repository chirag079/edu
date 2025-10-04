"use server";

import { v2 as cloudinary } from "cloudinary";
import { auth } from "../auth";

// Configure Cloudinary (ensure environment variables are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

/**
 * Uploads an image file to Cloudinary.
 * @param {FormData} formData - Must contain a 'file' entry with the image file.
 * @returns {Promise<object>} - Result object { success: boolean, message: string, imageUrl?: string }
 */
export async function uploadImage(formData) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Authentication required." };
  }

  const file = formData.get("file");

  if (!file) {
    return { success: false, message: "No file provided." };
  }

  // Basic validation (can be expanded)
  if (
    typeof file !== "object" ||
    file === null ||
    typeof file.name !== "string" ||
    typeof file.size !== "number" ||
    typeof file.type !== "string"
  ) {
    // console.error("Invalid file data received:", file);
    return { success: false, message: "Invalid file data provided." };
  }

  if (file.size > 1 * 1024 * 1024) {
    // Max 1MB
    return { success: false, message: "File size exceeds 1MB limit." };
  }

  if (
    !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)
  ) {
    return {
      success: false,
      message: "Invalid file type. Only JPG, PNG, WEBP, GIF allowed.",
    };
  }

  try {
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            // Optional: Add tags, folder, transformations
            folder: "edustation_listings", // Example folder
            // resource_type: "image", // Default
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error("Cloudinary upload failed to return a secure URL.");
    }

    console.log(`Image uploaded successfully: ${uploadResult.secure_url}`);
    return {
      success: true,
      message: "Image uploaded successfully.",
      imageUrl: uploadResult.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return { success: false, message: "Failed to upload image." };
  }
}
