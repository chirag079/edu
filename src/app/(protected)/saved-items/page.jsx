"use client"; // Need client state for displaying items, potential removal actions

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Bookmark, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { getSavedItemsDetails, unsaveItem } from "@/actions/user.actions"; // Import the actions
import ListingCard from "@/components/ListingCard"; // Import the card component
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SavedItemsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedItems, setSavedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, startTransition] = useTransition();
  const [removingItemId, setRemovingItemId] = useState(null); // Track which item is being removed
  const [error, setError] = useState("");

  // Function to fetch saved items
  const fetchSavedItems = () => {
    if (session?.user?.id) {
      setIsLoading(true);
      setError("");
      getSavedItemsDetails(session.user.id)
        .then((data) => {
          setSavedItems(data);
        })
        .catch((err) => {
          console.error("Failed to fetch saved items:", err);
          setError("Could not load your saved items. Please try again later.");
          toast.error("Could not load your saved items.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      status === "authenticated" &&
      session?.user?.role !== "explorer"
    ) {
      toast.error("Access denied. This page is for explorers.");
      router.push("/dashboard"); // Redirect non-explorers
    } else if (status === "authenticated") {
      fetchSavedItems(); // Initial fetch
    }
  }, [session, status, router, fetchSavedItems]);

  // Handler for unsaving an item
  const handleUnsave = (listingId) => {
    if (!session?.user?.id) return;
    setRemovingItemId(listingId); // Set which item is being processed
    startTransition(async () => {
      try {
        const result = await unsaveItem(session.user.id, listingId);
        if (result.success) {
          toast.success(result.message || "Item removed successfully.");
          // Optimistically remove from state or refetch
          setSavedItems((prev) => prev.filter((item) => item.id !== listingId));
          // Alternatively: fetchSavedItems(); // Refetch data
        } else {
          toast.error(result.message || "Failed to remove item.");
        }
      } catch (err) {
        console.error("Unsave item error:", err);
        toast.error("An unexpected error occurred while removing the item.");
      }
      setRemovingItemId(null); // Reset removing state
    });
  };

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-900/50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 flex items-center">
          <Bookmark className="mr-3 h-7 w-7" /> Saved Items
        </h1>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Display Saved Items or Message */}
        {!isLoading && savedItems.length === 0 && !error && (
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm text-center">
            <p className="text-gray-500 dark:text-gray-400">
              You haven&apos;t saved any items yet.
            </p>
            <Link href="/search" className="mt-4 inline-block">
              <Button variant="outline">Start Browsing</Button>
            </Link>
          </div>
        )}

        {savedItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedItems.map((item) => (
              <ListingCard key={item.id} listing={item}>
                {/* Pass custom button as children */}
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleUnsave(item.id)}
                  disabled={isRemoving && removingItemId === item.id}
                >
                  {isRemoving && removingItemId === item.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Remove
                </Button>
              </ListingCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
