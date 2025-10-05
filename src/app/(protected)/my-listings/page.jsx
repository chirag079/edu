import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  getUserListings,
  getUserEvents,
  getUserRestaurants,
} from "@/actions/listing.actions";
import SSRLoader from "@/components/SSRLoader";
import ListingsTableClient from "./ListingsTableClient";

export default async function MyListingsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Redirect if not logged in or not an advertiser
  if (!userId || session.user.role !== "advertiser") {
    console.log(
      "Redirecting from MyListingsPage due to missing session or wrong role."
    );
    return redirect("/login?error=Unauthorized");
  }

  // Fetch all user items
  const [userListings, userEvents, userRestaurants] = await Promise.all([
    getUserListings(userId),
    getUserEvents(userId),
    getUserRestaurants(userId),
  ]);

  // Combine and sort all items
  const allUserItems = [
    ...userListings,
    ...userEvents,
    ...userRestaurants,
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-900/50 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Suspense fallback={<SSRLoader />}>
          <ListingsTableClient items={allUserItems} />
        </Suspense>
      </div>
    </div>
  );
}
