import { fetchCompleteBorrowRequests } from "@/actions/borrower.actions";
import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import groot from "../../../../public/groot.jpg";
import Image from "next/image";
import { modifyDate } from "@/lib/helper/dataModifier";
import Link from "next/link";
import { fetchCompleteLendingRequests } from "@/actions/seller.actions";

export default async function OrderSummary() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  const a =
    role === "Buyer"
      ? await fetchCompleteBorrowRequests(userId)
      : await fetchCompleteLendingRequests(userId);
  //   console.log(a);
  return (
    <div className="min-h-screen flex flex-col items-center    space-y-10 sm:pt-10 pt-30 mb-10">
      <h1 className="flex font-bold text-4xl ">Order Summary</h1>
      <div className="container flex flex-col items-center md:gap-6 gap-3">
        {a.length === 0 && (
          <h1 className="text-center">Sorry no order request is made</h1>
        )}
        {a.length > 1 &&
          a.map((request) => {
            return (
              <Card key={request?._id} className="w-full">
                <CardHeader className="flex flex-col gap-2 ">
                  <Link
                    href={`/search/?type=${
                      request.onModel === "flats" ? "Flat" : "Stationary"
                    }&name=${request?.Model?.name}&id=${request?.Model?._id}`}
                  >
                    <CardTitle className="capitalize hover:underline hover:cursor-pointer transition-all duration-200 delay-300">
                      {request?.Model?.name}
                    </CardTitle>
                  </Link>
                  <h1 className="flex items-center ">
                    Status :{" "}
                    <span
                      className={
                        request?.approvalStatus !== "Declined"
                          ? "font-bold text-green-500 ml-2 tracking-wide"
                          : "font-bold text-red-500 ml-2 tracking-wide"
                      }
                    >
                      {request?.approvalStatus}
                    </span>
                  </h1>
                </CardHeader>
                <CardContent className="grid md:grid-cols-12 grid-cols-1 gap-2 sm:py-5 ">
                  <div className="md:col-span-7 col-span-1  flex flex-col gap-3 ">
                    <div className="flex items-center gap-3 justify-start">
                      <h1 className=" font-semibold">Category:</h1>
                      <CardDescription className="capitalize font-bold">
                        {request?.onModel}
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-3 justify-start">
                      <h1 className=" font-semibold">Price:</h1>
                      <CardDescription className="capitalize font-bold">
                        ${request?.Model?.price}
                      </CardDescription>
                    </div>
                    <div className="flex  gap-3 justify-start    ">
                      <h1 className=" font-semibold">Description:</h1>
                      <CardDescription className="capitalize font-bold flex flex-col break-words md:w-10/12 w-8/12  pr-3 mr-3 ">
                        {request?.Model?.description}
                      </CardDescription>
                    </div>
                    <div className="flex  gap-3 justify-start items-center    ">
                      <h1 className=" font-semibold">College:</h1>
                      <CardDescription className="capitalize font-bold  ">
                        {request?.Model?.availableCollege !== " "
                          ? request?.Model?.availableCollege
                          : "Not Available"}
                      </CardDescription>
                    </div>
                    <div className="flex  gap-3 justify-start items-center    ">
                      <h1 className=" font-semibold">Created:</h1>
                      <CardDescription className="capitalize font-bold  ">
                        {modifyDate(request?.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex  gap-3 justify-start items-center    ">
                      <h1 className=" font-semibold">
                        {role === "Buyer" ? "Seller:" : "Buyer:"}
                      </h1>
                      <CardDescription className="capitalize font-bold  ">
                        {role === "Buyer"
                          ? request?.lender?.email
                          : request?.borrower?.email}
                      </CardDescription>
                    </div>
                    {role !== "Buyer" && (
                      <div className="flex  gap-3 justify-start items-center    ">
                        <h1 className=" font-semibold">Contact Number:</h1>
                        <CardDescription className="capitalize font-bold  ">
                          {request?.borrower?.mobile}
                        </CardDescription>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-5 md:col-start-8 col-span-1  sm:h-72 h-36  ">
                    <Image
                      width={500}
                      height={500}
                      alt="image"
                      src={
                        request?.Model?.image ? request?.Model?.image : groot
                      }
                      className=" h-full w-full rounded-xl  "
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
