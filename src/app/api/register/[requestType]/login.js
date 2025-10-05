import { signIn } from "next-auth/react";
import { connecToDb } from "@/lib/connectToDb";
import { verifyPassword } from "@/lib/helper/bcrypt";
import { User } from "@/lib/models/user.schema";
import { zodLoginSchema } from "@/lib/models/zod .schema";
import { errorResponse } from "@/lib/utils/error.response";
import { successResponse } from "@/lib/utils/success.response";
import { StatusCodes } from "http-status-codes";
import { fromZodError } from "zod-validation-error";
import { NextResponse } from "next/server";

export async function Login(req) {
  try {
    await connecToDb();
    const data = await req.json();

    const username = data.username;
    const password = data.password;

    const result = zodLoginSchema.safeParse({ username, password });
    if (!result.success) {
      const validationError = fromZodError(result.error);
      return errorResponse(
        validationError.details[0].message,
        validationError.name
      );
    }

    const user = await User.findOne({ username: username });
    if (!user) {
      return errorResponse(
        "User Does not Exist",
        "authorisation error",
        StatusCodes.UNAUTHORIZED
      );
    }

    const isCorrectPassword = await verifyPassword(password, user?.password);
    if (!isCorrectPassword) {
      return errorResponse(
        "Invalid Credentials",
        "authorisation error",
        StatusCodes.UNAUTHORIZED
      );
    }

    const signInResult = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (!signInResult?.ok) {
      return errorResponse(
        "Authentication failed",
        "authorisation error",
        StatusCodes.UNAUTHORIZED
      );
    }

    // Return success response with user data and redirect URL
    return NextResponse.json(
      {
        success: true,
        message: "Successfully Logged in",
        data: {
          user: {
            id: user._id.toString(),
            username,
            role: user.role,
            registrationCompleted: user.registrationCompleted,
            college: user.college,
          },
          redirect: user.registrationCompleted
            ? "/dashboard"
            : "/profile/complete",
        },
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(
      "An error occurred during login",
      "server error",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
