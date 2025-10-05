"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import axios from "axios";
import { updateRequestStatus } from "@/actions/seller.actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export function DialogDemo({ productId, type }) {
  const router = useRouter();
  const [data, setdata] = useState({});
  const [isloaded, setisloaded] = useState(false);
  const [keys, setkeys] = useState([]);
  const handleOnClick = async (product) => {
    try {
      const data = await axios.get(`/api/Seller/${product}`);
      setdata(data?.data?.Data?.Model);
      setisloaded(true);
      const key = Object.keys(data?.data?.Data?.Model);
      //   console.log(key);
      setkeys(key);

      return;
    } catch (error) {
      setisloaded(false);
      console.error(error);
      return;
    }
  };
  const handleRequestStatus = async (product, status) => {
    try {
      await updateRequestStatus(product, status);
      toast.dark("Request Updated");
      const btn = document.getElementById("triggerButton");
      btn.click();

      return;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  return (
    <Dialog>
      <DialogTrigger id="triggerButton" asChild>
        <Button
          onClick={() => {
            handleOnClick(productId);
          }}
          className="hover:bg-primary hover:text-primary-foreground"
          variant="outline"
        >
          Open
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Item Description</DialogTitle>
        </DialogHeader>
        {isloaded ? (
          <>
            <Table className="">
              <TableCaption></TableCaption>

              <TableBody>
                {keys.map((key) => (
                  <TableRow className="  " key={key}>
                    <TableCell className=" capitalize font-medium  ">
                      {key + ""}
                    </TableCell>
                    {/* {console.log(data[key])} */}
                    {/* <TableCell>{admin?.createdAt}</TableCell> */}
                    <TableCell className=" flex flex-col">
                      {data[key] + ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {type === "Lender" && (
              <div className="flex gap-2 items-end my-4 border-0 ">
                <Button
                  onClick={() => {
                    handleRequestStatus(productId, "Approved");
                  }}
                  className="text-green-600  bg-green-200"
                >
                  Accept{" "}
                </Button>
                <Button
                  onClick={() => {
                    handleRequestStatus(productId, "Declined");
                  }}
                  variant="destructive"
                >
                  {" "}
                  Decline
                </Button>
              </div>
            )}
          </>
        ) : (
          <ShimmerUi />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ShimmerUi() {
  return (
    <div className="flex flex-col  items-start px-10 space-y-3">
      <Skeleton className="h-[150px] w-11/12 rounded-xl" />
      <Skeleton className="h-[30px] w-8/12 rounded-xl" />
      <div className="flex justify-between w-full  ">
        <Skeleton className="h-[40px] w-5/12 rounded-xl" />
        <div className="flex flex-col gap-2 items-center">
          <div className="h-10 w-28" />

          <Skeleton className="h-10 w-28 " />
        </div>
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}
