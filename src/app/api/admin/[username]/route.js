import { connecToDb } from "@/lib/connectToDb";
import { User } from "@/lib/models/user.schema";
import { errorResponse } from "@/lib/utils/error.response";
import { successResponse } from "@/lib/utils/success.response";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { fromZodError } from "zod-validation-error";

const zodInputUsernameSchema = z.object({
  username: z.string(),
});

export async function GET(request, { params }) {
  try {
    await connecToDb();
    // console.log(param);
    const usernameToFind = params.username;
    const result = zodInputUsernameSchema.safeParse({
      username: usernameToFind,
    });
    if (!result.success) {
      const validationError = fromZodError(result.error);

      return errorResponse(
        validationError.details[0].message,
        validationError.name
      );
    }
    const users = await User.find({
      username: { $regex: usernameToFind, $options: "i" },
      role: ["Buyer", "Seller"],
    }).select(["username", "email", "_id"]);
    return successResponse("User Fetched succesfully", users, StatusCodes.OK);
  } catch (error) {
    return errorResponse(error.message, error.type, error.statusCode);
  }
}
