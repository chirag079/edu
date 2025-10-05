"use client";

const { Button } = require("@/components/ui/button");
import {
  checkIfAlreadyProcessed,
  processApprovalRequest,
} from "@/actions/admin.actions";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import mongoose from "mongoose";
import { toast } from "react-toastify";

export function ClientItemRequest({ itemId, type }) {
  const router = useRouter();
  // console.log(userId, itemId);
  const [buttonError, setbuttonError] = useState({ loaded: false, data: "" });
  const [isClicked, setisClicked] = useState(false);

  useEffect(() => {
    async function isDuplicateRequestExist() {
      try {
        const data = await checkIfAlreadyProcessed(itemId);

        if (!Boolean(data)) {
          setbuttonError({ loaded: true, data: "" });
        } else {
          setbuttonError({ loaded: true, data: "Request  processed" });
        }
      } catch (error) {
        setbuttonError({ loaded: true, data: "internal server error" });
      }
    }
    isDuplicateRequestExist();
  }, [isClicked, itemId]);

  return (
    <>
      {!buttonError.loaded ? (
        <></>
      ) : buttonError.data.length > 1 ? (
        <h1 className="text-destructive mb-2 opacity-90 text-sm  mt-3">
          {buttonError.data}
        </h1>
      ) : (
        <div className="flex items-center gap-1">
          <Button
            onClick={() => {
              async function handleOnclick() {
                await processApprovalRequest(itemId, type, "Approve");
                toast.success("Request Approved");
              }
              handleOnclick();
              setisClicked(true);
            }}
            variant=""
            className="ml-2 bg-green-200 text-green-500 hover:bg-green-500 hover:text-green-200 "
          >
            {" "}
            Approve{" "}
          </Button>
          <Button
            onClick={() => {
              async function handleOnclick() {
                await processApprovalRequest(itemId, type, "Reject");
                toast.error("Request declined");
              }
              handleOnclick();
              setisClicked(true);
            }}
            variant="destructive"
            className=""
          >
            {" "}
            Decline{" "}
          </Button>
        </div>
      )}
    </>
  );
}
