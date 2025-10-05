import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

export function successResponse(Message, Data, StatusCode) {
  return NextResponse.json(
    {
      Status: "True",
      Message: Message ? Message : "Succesfully Passed",
      Data: Data ? Data : "Undefined",
    },
    { status: StatusCode ? StatusCode : StatusCodes.ACCEPTED }
  );
}
