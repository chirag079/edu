import { successResponse } from "@/lib/utils/success.response";

export async function GET() {
  return successResponse("hello From admin route", "again hello");
}
