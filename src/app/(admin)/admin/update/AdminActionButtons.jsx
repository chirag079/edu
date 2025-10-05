"use client";

import { useState, useTransition } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Check, X, Trash2, UserCog } from "lucide-react";
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

// Import all necessary actions
import {
  approveListing,
  rejectListing,
  approveEvent,
  rejectEvent,
  approveRestaurant,
  rejectRestaurant,
  updateUserRole,
  deleteUser, // Keep user actions
} from "@/actions/admin.actions";

export default function AdminActionButtons({
  // --- Props for Item Approval ---
  itemId, // Renamed from listingId
  itemType, // NEW: To determine which actions to call
  // Removed onApprove, onReject props

  // --- Props for User Management ---
  userId,
  currentRole,
  // Removed onUpdateRole, onDelete props (actions imported directly)
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState(currentRole);

  // --- Item Approval Handlers ---
  const handleApprove = () => {
    if (!itemId || !itemType) return;

    // Determine the correct action based on itemType
    let action;
    switch (itemType) {
      case "Event":
        action = approveEvent;
        break;
      case "Restaurant":
        action = approveRestaurant;
        break;
      case "Book":
      case "Stationary":
      case "Flat/PG":
      default: // Default to Listing action for known Listing types
        action = approveListing;
        break;
    }

    startTransition(async () => {
      try {
        const result = await action(itemId);
        if (result.success) {
          toast.success(`${itemType} approved successfully!`);
        } else {
          toast.error(result.message || `Failed to approve ${itemType}.`);
        }
      } catch (err) {
        toast.error(`An error occurred during ${itemType} approval.`);
        console.error(err);
      }
    });
  };

  const handleReject = () => {
    if (!itemId || !itemType) return;

    // Determine the correct action based on itemType
    let action;
    switch (itemType) {
      case "Event":
        action = rejectEvent;
        break;
      case "Restaurant":
        action = rejectRestaurant;
        break;
      case "Book":
      case "Stationary":
      case "Flat/PG":
      default: // Default to Listing action
        action = rejectListing;
        break;
    }

    startTransition(async () => {
      try {
        const result = await action(itemId);
        if (result.success) {
          toast.success(`${itemType} rejected successfully!`);
        } else {
          toast.error(result.message || `Failed to reject ${itemType}.`);
        }
      } catch (err) {
        toast.error(`An error occurred during ${itemType} rejection.`);
        console.error(err);
      }
    });
  };

  // --- User Management Handlers ---
  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    if (!userId || newRole === currentRole) return;
    startTransition(async () => {
      try {
        // Call action directly
        const result = await updateUserRole(userId, newRole);
        if (result.success) {
          toast.success(`User role updated to ${newRole}.`);
        } else {
          toast.error(result.message || "Failed to update role.");
          setSelectedRole(currentRole);
        }
      } catch (err) {
        toast.error("An error occurred updating role.");
        console.error(err);
        setSelectedRole(currentRole);
      }
    });
  };

  const handleDeleteUser = () => {
    if (!userId) return;
    startTransition(async () => {
      try {
        // Call action directly
        const result = await deleteUser(userId);
        if (result.success) {
          toast.success("User deleted successfully!");
        } else {
          toast.error(result.message || "Failed to delete user.");
        }
      } catch (err) {
        toast.error("An error occurred deleting user.");
        console.error(err);
      }
    });
  };

  // --- Render Logic ---
  // Decide which set of buttons to render based on props
  if (itemId && itemType) {
    // Item approval buttons
    return (
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleApprove} // Calls updated handler
          disabled={isPending}
          className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          <span className="ml-1 hidden sm:inline">Approve</span>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleReject} // Calls updated handler
          disabled={isPending}
          className="bg-red-50 hover:bg-red-100 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
          <span className="ml-1 hidden sm:inline">Reject</span>
        </Button>
      </div>
    );
  } else if (userId) {
    // User management buttons
    return (
      <div className="flex justify-end items-center gap-2">
        <Select
          value={selectedRole}
          onValueChange={handleRoleChange} // Calls updated handler
          disabled={isPending}
        >
          <SelectTrigger className="w-[120px] h-9 text-xs">
            <SelectValue placeholder="Change role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="explorer">Explorer</SelectItem>
            <SelectItem value="advertiser">Advertiser</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="h-9 w-9"
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                user and their associated data (if applicable).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser} // Calls updated handler
                className="bg-destructive hover:bg-destructive/90"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete User"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return null;
}
