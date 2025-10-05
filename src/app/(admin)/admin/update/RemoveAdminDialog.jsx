"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

import { deleteAdmin } from "@/actions/admin.actions";
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
import { toast } from "react-toastify";
export function RemoveAdminDialog({ title, warning, username }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className="hover:bg-red-400 dark:hover:bg-red-500"
        asChild
      >
        <Button variant="outline">{title ? title : "Provide Title"}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {warning ? warning : "Provide a warning"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={() => {
              startTransition(async () => {
                try {
                  await deleteAdmin(username);
                  router.refresh();
                } catch (error) {
                  toast.error("An error Occured While deleting the User", {
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
