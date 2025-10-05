import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

import { MousePointerSquare } from "lucide-react";
import avenger from "../../../../public/avenger.jpg";
import superman from "../../../../public/superman.jpg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { fetchAdminDetails } from "@/actions/admin.actions";
import { redirect } from "next/navigation";
import {
  Users, // Icon for user management
  ClipboardList, // Icon for pending approvals
  ShieldCheck, // Icon for responsibilities
} from "lucide-react";
import {
  getPendingListingsCount, // Existing
  getUserCount, // Existing
  // Import new count actions
  getPendingEventsCount,
  getPendingRestaurantsCount,
} from "@/actions/admin.actions";

async function Page() {
  const session = await auth();
  if (!session) {
    return redirect("/login");
  }
  const id = session?.user?.id;
  const data = await fetchAdminDetails(id);

  // Middleware should handle auth/role check, but double-check
  if (!session?.user || session.user.role !== "admin") {
    return redirect("/login?error=Unauthorized");
  }

  const { name, username, email } = session.user;

  // Fetch ALL pending counts
  const [pendingListings, pendingEvents, pendingRestaurants, totalUsers] =
    await Promise.all([
      getPendingListingsCount(),
      getPendingEventsCount(), // Fetch event count
      getPendingRestaurantsCount(), // Fetch restaurant count
      getUserCount(),
    ]);

  // Calculate total pending count
  const totalPendingApprovals =
    pendingListings + pendingEvents + pendingRestaurants;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-900/50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome, {name || username}!
            </p>
          </div>
          <Link href="/admin/update">
            <Button>
              <ClipboardList className="mr-2 h-4 w-4" /> Manage Duties
            </Button>
          </Link>
        </header>

        {/* Grid for Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Approvals Card - Updated Count */}
          <Card className="bg-white dark:bg-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pending Approvals
              </CardTitle>
              <ClipboardList className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {totalPendingApprovals || 0} {/* Use the combined count */}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Listings, events, and restaurants awaiting review.
              </p>
              <Link
                href="/admin/update?tab=approvals"
                className="text-xs text-blue-600 hover:underline dark:text-blue-400 mt-1 block"
              >
                Review Items &rarr;
              </Link>
            </CardContent>
          </Card>

          {/* User Management Card - Updated Count */}
          <Card className="bg-white dark:bg-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                User Management
              </CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {totalUsers || 0} {/* Use correct variable */}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total registered users.
              </p>
              <Link
                href="/admin/update?tab=users"
                className="text-xs text-blue-600 hover:underline dark:text-blue-400 mt-1 block"
              >
                Manage Users &rarr;
              </Link>
            </CardContent>
          </Card>

          {/* Your Credentials Card */}
          <Card className="bg-white dark:bg-zinc-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <p>
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  Username:
                </span>{" "}
                {username}
              </p>
              <p>
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  Email:
                </span>{" "}
                {email}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Responsibilities Section */}
        <section>
          <Card className="bg-white dark:bg-zinc-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-green-600" />
                <CardTitle className="text-xl text-gray-900 dark:text-gray-50">
                  Admin Responsibilities
                </CardTitle>
              </div>
              <CardDescription className="dark:text-gray-400">
                With great power comes great responsibility. Use your admin
                privileges wisely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p>• Approve or reject advertiser listing requests.</p>
              <p>
                • Promote or demote users between roles (e.g., explorer,
                advertiser, admin).
              </p>
              <p>• Remove users or inappropriate content if necessary.</p>
              <p>
                • Ensure the platform guidelines and code of conduct are
                followed.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

export default Page;
