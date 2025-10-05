import { connecToDb } from "@/lib/connectToDb";
import { Request } from "@/lib/models/Request.schema";
import { errorResponse } from "@/lib/utils/error.response";
import { successResponse } from "@/lib/utils/success.response";
import { StatusCodes } from "http-status-codes";

export async function GET(req, { params }) {
  try {
    await connecToDb();
    const requestedItem = params.fetchitem;
    await connecToDb();
    const result = await Request.findOne({ Model: requestedItem }).populate(
      "Model",
      {
        tags: 0,
        available: 0,
        createdAt: 0,
        updatedAt: 0,
        borrowers: 0,
        lender: 0,
        __v: 0,
        _id: 0,
        approvalStatus: 0,
      }
    );
    return successResponse("Found Succesfully", result, StatusCodes.OK);
  } catch (error) {
    return errorResponse(error.message, error.type, StatusCodes.BAD_REQUEST);
  }
}
