import { successResponse } from "@/lib/utils/success.response";
import { errorResponse } from "@/lib/utils/error.response";
import { StatusCodes } from "http-status-codes";
import { connecToDb } from "@/lib/connectToDb";
import { zodUserDetailsSchema } from "@/lib/models/zod .schema";
import { fromZodError } from "zod-validation-error";
import { User } from "@/lib/models/user.schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function PUT(req) {
  try {
    await connecToDb();
    const data = await req.json();
    const mobile = data.mobileNumber;
    const address = data.adress;
    const username = data.username;
    const college = data.college;
    const result = zodUserDetailsSchema.safeParse({
      mobile: mobile - 0,
      address,
      college,
    });
    if (!result.success) {
      const validationError = fromZodError(result.error);

      return errorResponse(
        validationError.details[0].message,
        validationError.name
      );
    }
    const isUsedMobileNumber = await User.findOne({ mobile: mobile });
    if (isUsedMobileNumber) {
      if (isUsedMobileNumber.username !== username) {
        return errorResponse(
          "Number Already In Use",
          "authorisation error",
          StatusCodes.CONFLICT
        );
      }
    }
    const user = await User.findOneAndUpdate(
      { username: username },
      {
        mobile: mobile,
        address: address,
        college: college,
        registrationCompleted: true,
      }
    );
    if (!user) {
      return errorResponse(
        "User Does not Exist",
        "authorisation error",
        StatusCodes.CONFLICT
      );
    }
    revalidatePath("/dashboard");
    return successResponse(
      "Succesfully Updated",
      "Updated",
      StatusCodes.ACCEPTED
    );
  } catch (error) {
    return errorResponse(error.message, error.type, error.statusCode);
  }
}

export async function GET(req) {
  try {
    const session = await auth();
    var userId = session?.user?.id;
    const registration = await User.findById(userId).select({
      registrationCompleted: 1,
    });
    return successResponse("ok", {
      status: Boolean(registration?.registrationCompleted),
    });
  } catch (error) {
    return errorResponse(error.message, error.type, error.statusCode);
  }
}
