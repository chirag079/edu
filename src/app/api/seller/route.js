import { successResponse } from "@/lib/utils/success.response";
import { errorResponse } from "@/lib/utils/error.response";
import { StatusCodes } from "http-status-codes";
import { connecToDb } from "@/lib/connectToDb";
import {
  zodFlatInputSchema,
  zodStationaryInputSchema,
} from "@/lib/models/zod .schema";
import { Stationary } from "@/lib/models/stationary.schema";
import { Flat } from "@/lib/models/flat.schema";
import { User } from "@/lib/models/user.schema";
import { auth } from "@/auth";
import { fromZodError } from "zod-validation-error";
import { uploadImageonCloudinary } from "@/lib/helper/cloudinary.config";
import { createAdminApproval } from "@/actions/seller.actions";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return redirect("/login");
    }
    const formdata = await req.formData();
    // console.log(formdata);
    const availableCollege = session?.user?.college;
    const img = formdata.get("image");
    const fileBuffer = await img.arrayBuffer();
    const mimeType = img.type;
    const encoding = "base64";
    const base64Data = Buffer.from(fileBuffer).toString("base64");
    const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;

    const data = {};
    formdata.forEach((value, key) => {
      if (key !== "image") {
        data[key] = key === "price" || key === "capacity" ? value - 0 : value;
      }
    });

    //continue here

    const model = data?.model === "Flat" ? Flat : Stationary;
    const validatedInput =
      data?.model === "Flat"
        ? zodFlatInputSchema.safeParse(data)
        : zodStationaryInputSchema.safeParse(data);

    if (!validatedInput.success) {
      const validationError = fromZodError(validatedInput.error);

      return errorResponse(
        validationError.details[0].message,
        validationError.name,
        StatusCodes.BAD_REQUEST
      );
    }

    // console.log(data?.tags.split(","));

    const username = session?.user?.username;

    await connecToDb();

    const isValidUser = await User.findOne({ username: username });
    if (!isValidUser || isValidUser?.role !== "Seller") {
      return errorResponse(
        "Not a valid User",
        "Authentication Error",
        StatusCodes.UNAUTHORIZED
      );
    }
    const imageLink = await uploadImageonCloudinary(fileUri, img.name);
    if (!imageLink) {
      return errorResponse(
        "Failed to upload image",
        "Cloudinary Error",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    const result = await model.create({
      ...data,
      lender: isValidUser?._id,
      image: imageLink,
      availableCollege: availableCollege,
      tags: [],
    });
    const productId = result?._id;

    const onModel = data?.model === "Flat" ? "flats" : "stationaries";

    const tags = data?.tags.split(",");
    await Promise.all(
      tags.map(async (tag) => {
        await model.findOneAndUpdate(productId, { $push: { tags: tag } });
      })
    );
    await createAdminApproval(productId, isValidUser?._id, onModel);

    return successResponse(
      "Succesfully Created",
      "Created",
      StatusCodes.ACCEPTED
    );
  } catch (error) {
    return errorResponse(error.message, error.type, error.statusCode);
  }
}
