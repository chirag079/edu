"use server";
import { fromZodError } from "zod-validation-error";

import { signIn } from "@/auth";
import { connecToDb } from "@/lib/connectToDb";

import { User } from "@/lib/models/user.schema";
import { zodUserSchema } from "@/lib/models/zod .schema";
import { CustomError } from "@/lib/utils/customError";
connecToDb();
export async function LoginAction(formdata) {
  try {
    const username = formdata.get("username");
    const password = formdata.get("password");
    await signIn("credentials", {
      username: username,
      password: password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function SignUpAction(formdata) {
  try {
    const username = formdata.get("username");
    const password = formdata.get("password");
    const email = formdata.get("email");
    const role = formdata.get("role");
    const result = zodUserSchema.safeParse({ username, password, email, role });

    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new CustomError(
        validationError.details[0].message,
        validationError.name
      );
    }

    // await User.create({
    //   username: formdata.get("username"),
    //   password: formdata.get("password"),
    //   email: formdata.get("email"),
    //   role: formdata.get("role"),
    // });
  } catch (error) {
    console.log(error);
  }
}
