import { connecToDb } from "@/lib/connectToDb";
import { hashPassword } from "@/lib/helper/bcrypt";
import { User } from "@/lib/models/user.schema";
import { zodUserSchema } from "@/lib/models/zod .schema";
import { errorResponse } from "@/lib/utils/error.response";
import { successResponse } from "@/lib/utils/success.response";

import { StatusCodes } from "http-status-codes";
import { fromZodError } from "zod-validation-error";
const { NextResponse } = require("next/server");

export async function Signup(req, res) {
  try {
    await connecToDb();
    const data = await req.json();

    const name = data.name;
    const username = data.username;
    const password = data.password;
    const email = data.email;
    const role = data.role;

    const result = zodUserSchema.safeParse({
      name,
      username,
      password,
      email,
      role,
    });
    if (!result.success) {
      const validationError = fromZodError(result.error);

      return errorResponse(
        validationError.details[0].message,
        validationError.name
      );
    }
    const usernameExist = await User.findOne({ username: username });
    const emailExist = await User.findOne({ email: email });
    if (usernameExist) {
      return errorResponse(
        "Username Exists",
        "authorisation error",
        StatusCodes.CONFLICT
      );
    }
    if (emailExist) {
      return errorResponse(
        "Email Exists",
        "authorisation error",
        StatusCodes.CONFLICT
      );
    }
    const hashedPass = await hashPassword(password);
    const response = await User.create({
      name,
      username,
      email,
      password: hashedPass,
      role,
    });
    // return NextResponse.json({ message: create }, { status: 200 });
    return successResponse(
      "Created user successfully",
      response,
      StatusCodes.ACCEPTED
    );
  } catch (error) {
    // return NextResponse.json({ message: error.message }, { status: 404 });
    return errorResponse(error.message, error.type, error.statusCode);
  }
}
