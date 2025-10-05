"use client";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Loader } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAdmin, promoteAdmin } from "@/actions/admin.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export function InputBox() {
  const [userInput, setuserInput] = useState("");
  const [fetchedUsers, setfetchedUsers] = useState(null);

  async function handleSubmit(username) {
    try {
      const response = await axios.get(`/api/admin/${username}`, {
        headers: { "Content-Type": "application/json" },
      });

      setfetchedUsers(response?.data?.Data);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Command>
      <CommandInput
        onChange={async (e) => {
          setuserInput(e.target.value);
          if (userInput.length >= 3) {
            await handleSubmit(userInput);
          }
        }}
        value={userInput}
        placeholder="Search For a User..."
      />
      <CommandList className="">
        {fetchedUsers && fetchedUsers.length < 1 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        {fetchedUsers && fetchedUsers.length >= 1 && (
          <div className="h-28">
            <CommandGroup heading="Available User">
              {fetchedUsers.map((user) => {
                return (
                  <div
                    className="flex  items-center justify-between px-2 "
                    key={user?._id}
                  >
                    <CommandItem className="">{user?.username} </CommandItem>
                    <PromoteButton username={user?.username} />
                  </div>
                );
              })}
              {/* <CommandItem>Calendar</CommandItem> */}
            </CommandGroup>
            {/* {/* <CommandSeparator /> */}
          </div>
        )}
      </CommandList>
    </Command>
  );
}

function PromoteButton({ username }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <AlertDialog>
      <AlertDialogTrigger
        className="hover:bg-green-400 dark:hover:bg-green-500"
        asChild
        id="promote"
      >
        <Button className="text-xs h-6  " variant="outline">
          Promote
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure ?</AlertDialogTitle>
          <AlertDialogDescription>
            You are promoting {username}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={() => {
              startTransition(async () => {
                try {
                  await promoteAdmin(username);
                  toast.success("Sucess", {
                    autoClose: 2000,
                    theme: "colored",
                  });
                  router.refresh();
                } catch (error) {
                  toast.error("An error Occured While promoting the User", {
                    autoClose: 2000,
                    theme: "colored",
                  });
                  router.refresh();
                  return;
                }
              });
            }}
          >
            {isPending ? <Loader className="animate-spin" /> : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
