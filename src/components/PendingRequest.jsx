"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCheck } from "lucide-react";

export function DropdownMenuRadioGroupDemo({ role }) {
  const [position, setPosition] = React.useState("bottom");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          {role === "Lender" ? "Pending" : "Approval"}
          <span className="ml-2">
            <UserCheck size={13} fill="green" color="green" />
          </span>{" "}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        {/* <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
        <DropdownMenuSeparator /> */}
        {role === "Borrower" && (
          <DropdownMenuRadioGroup
            className="gap-2 flex flex-col"
            value={position}
            onValueChange={setPosition}
          >
            <DropdownMenuRadioItem value="top">
              <div className="flex items-center justify-between w-full">
                <div className="font-bold">Fairy Tale</div>
                <div className="px-2 py-1 rounded-3xl bg-red-200 border font-light text-sm border-red-500">
                  Pending
                </div>
              </div>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="top">
              <div className="flex items-center justify-between w-full">
                <div className="font-bold">H.C. Verma</div>
                <div className="px-2 py-1 rounded-3xl bg-red-200 border font-light text-sm border-red-500">
                  Pending
                </div>
              </div>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="top">
              <div className="flex items-center justify-between w-full">
                <div className="font-bold">Boys P.G.</div>
                <div className="px-2 py-1 rounded-3xl bg-green-200 border font-light text-sm border-green-500">
                  Approved{" "}
                </div>
              </div>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        )}
        {role === "Lender" && (
          <DropdownMenuRadioGroup
            className="gap-4 flex flex-col"
            value={position}
            onValueChange={setPosition}
          >
            <DropdownMenuRadioItem value="">
              <div className="flex flex-col gap-2 ">
                <div className="flex items-center justify-between gap-16 w-full">
                  <div className="font-bold">Fairy Tale</div>
                  <div className=" font-light text-sm text-muted-foreground">
                    -archit(NSUT)
                  </div>
                </div>
                <div className="flex w-full justify-center items-center gap-4 font-light  text-sm">
                  <h1 className="bg-green-200 border border-green-600 text-green-800 rounded-3xl px-2 py-1">
                    Approve
                  </h1>
                  <h1 className="bg-red-200 border border-red-600 text-red-800 rounded-3xl px-2 py-1">
                    Reject
                  </h1>
                </div>
              </div>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bpo">
              <div className="flex flex-col gap-2 ">
                <div className="flex w-full items-center justify-between gap-16 ">
                  <div className="font-bold">Boys Flat</div>
                  <div className=" font-light text-sm text-muted-foreground">
                    -arvind(NSUT)
                  </div>
                </div>
                <div className="flex w-full justify-center items-center gap-4 font-light  text-sm">
                  <h1 className="bg-green-200 border border-green-600 text-green-800 rounded-3xl px-2 py-1">
                    Approve
                  </h1>
                  <h1 className="bg-red-200 border border-red-600 text-red-800 rounded-3xl px-2 py-1">
                    Reject
                  </h1>
                </div>
              </div>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
