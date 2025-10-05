import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

export function errorResponse(Message, Type, StatusCode) {
  return NextResponse.json(
    {
      Status: "Fail",
      Message: Message ? Message : "Something went wrong",
      Type: Type ? Type : "Undefined",
    },
    { status: StatusCode ? StatusCode : StatusCodes.BAD_REQUEST }
  );
}
