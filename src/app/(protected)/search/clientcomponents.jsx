"use client";

const { Button } = require("@/components/ui/button");
import {
  checkDuplicateRequest,
  createPurchaseRequest,
} from "@/actions/borrower.actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import mongoose from "mongoose";
import { toast } from "react-toastify";

export function ClientItemRequest({ userId, itemId, type }) {
  const router = useRouter();
  // console.log(userId, itemId);
  const [buttonError, setbuttonError] = useState({ loaded: false, data: "" });
  const [isClicked, setisClicked] = useState(false);

  useEffect(() => {
    async function isDuplicateRequestExist() {
      try {
        const data = await checkDuplicateRequest(userId, itemId);

        if (Boolean(data?.Message)) {
          setbuttonError({ loaded: true, data: "" });
        } else {
          setbuttonError({ loaded: true, data: data?.Data });
        }
      } catch (error) {
        setbuttonError({ loaded: true, data: "internal server error" });
      }
    }
    isDuplicateRequestExist();
  }, [isClicked, userId, itemId]);

  return (
    <>
      {!buttonError.loaded ? (
        <></>
      ) : buttonError.data.length > 1 ? (
        <h1 className="text-destructive opacity-90 text-sm  mt-3">
          {buttonError.data}
        </h1>
      ) : (
        <Button
          onClick={() => {
            async function handleOnclick() {
              await createPurchaseRequest(itemId, type);
              toast.success("Request sent to seller, wait for confirmation");
            }
            handleOnclick();
            setisClicked(true);
          }}
          variant=""
          className="ml-2"
        >
          {" "}
          Notify Seller
        </Button>
      )}
    </>
  );
}
