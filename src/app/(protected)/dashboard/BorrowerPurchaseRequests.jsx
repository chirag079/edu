import { fetchBorrowRequests } from "@/actions/borrower.actions";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DialogDemo } from "./RequestProductInfo";

export default async function BorrowerPurchaseRequests({ userId }) {
  const requests = await fetchBorrowRequests(userId);
  // console.log(requests);
  return (
    <div className="flex flex-col  items-center  w-full">
      <div className="flex items-start w-9/12">
        <h4 className="mb-4 text-2xl font-bold leading-none ">
          Borrow Requests{" "}
          <span className="ml-2 font-light text-sm max-sm:hidden">
            ({requests?.length})
          </span>
        </h4>
      </div>

      <ScrollArea className="md:h-32  h-40  bg-popover    md:w-9/12 w-10/12 rounded-md border shadow ">
        {/* <ScrollArea className="md:h-44  h-40  bg-popover    md:w-9/12 w-10/12 rounded-md border shadow "> */}
        <div className="pb-2  w-11/12 mx-auto rounded-xl   flex flex-col items-center my-auto ">
          {requests.length > 0 &&
            requests.map((request) => {
              return (
                <div className="w-full   my-1  " key={request?._id}>
                  <div className="flex   flex-row justify-between  mx-auto md:px-8 px-3 py-1 items-center hover:bg-accent   transition-all delay-0 duration-200 ease-in-out">
                    <div className="font-semibold  tracking-wide text-sm capitalize overflow-clip  ">
                      {request?.Model?.name}
                    </div>
                    <div className="flex  flex-row gap-1">
                      {/* <Button variant="" className="font-light h-8      ">
                        Open
                      </Button> */}
                      <DialogDemo
                        className="h-8"
                        type="Borrower"
                        productId={request?.Model?._id + ""}
                      />
                    </div>
                  </div>
                  <Separator className=" w-full" />
                </div>
              );
            })}

          {requests.length == 0 && (
            <div className="  text-start font-light pl-3 mt-6 ">
              All customer pending borrow request will be shown here. Currently
              &apos;0&apos; pending borrow request is made.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

{
  /* <div className="  ">
              <CardHeader>
                <CardTitle>
                  {"Registered User"} */
}
{
  /* {isRegistered ? "Edit Profile" : "Registration Incomplete"} */
}
{
  /* </CardTitle>
              </CardHeader>

              <CardContent className="">
                <div className="w-full  ">
                  {`You can edit your profile by visiting profile section , `}
                  {isRegistered
                    ? `You can edit your profile by visiting profile section , `
                    : `You need to complete your registration before proceeding further , `}
                  <span className="font-light text-blue-500 hover:font-medium transition-all hover:underline ease-in-out ">
                    <Link href="/profile">click here</Link>
                  </span>
                </div>
              </CardContent>
            </div> */
}
