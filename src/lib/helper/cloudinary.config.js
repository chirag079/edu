const { v2 } = require("cloudinary");
const path = require("path");

v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadImageonCloudinary = async (fileUri, fileName) => {
  try {
    const result = await v2.uploader.upload(fileUri, {
      invalidate: true,
      resource_type: "auto",
      filename_override: fileName,
      use_filename: true,
    });

    return result?.secure_url;
  } catch (error) {
    console.log(error);
    return null;
  }
};
