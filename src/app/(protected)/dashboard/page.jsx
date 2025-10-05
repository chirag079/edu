import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
// import profilereplacement from "../../../../public/profilereplacement.jpg"; // Image unused for now
// import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  Search,
  PlusCircle,
  MessageSquare,
  BookOpen, // Icon for books/stationary
  Building2, // Icon for flats/pg
  CalendarDays, // Icon for events
  UtensilsCrossed, // Import Restaurant icon
} from "lucide-react";
// Import stub actions
import { getUserWalletBalance } from "@/actions/wallet.actions";
import {
  getUserListingsCount,
  getTotalUserItemsCount,
  getApprovedListings,
  getApprovedEvents,
  getApprovedRestaurants,
} from "@/actions/listing.actions";
import { getUnreadMessagesCount } from "@/actions/chat.actions";
import ServiceCarousel from "./ServiceCarousel"; // Import the new carousel component

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    return redirect("/login?error=SessionExpired");
  }
  if (!session.user.isVerified) {
    return redirect("/complete-profile?error=VerificationRequired");
  }

  const { name, username, role, id: userId, college } = session.user;

  // --- Data Fetching using Correct Actions & College Filter ---
  const [
    walletBalance,
    unreadMessages,
    userItemsCount,
    approvedStationary,
    approvedFlats,
    approvedEvents,
    approvedRestaurants,
  ] = await Promise.all([
    role === "advertiser" ? getUserWalletBalance(userId) : Promise.resolve(0),
    getUnreadMessagesCount(userId),
    role === "advertiser" ? getTotalUserItemsCount(userId) : Promise.resolve(0),
    getApprovedListings(5, "Stationary", college),
    getApprovedListings(5, "Flat/PG", college),
    getApprovedEvents(5, college),
    getApprovedRestaurants(5, college),
  ]);
  // --- End Data Fetching ---

  // Assuming roles are 'advertiser' and 'explorer'
  const isAdvertiser = role === "advertiser";
  const isExplorer = role === "explorer";

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-900/50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              Welcome, {name || username}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your personalized dashboard for {college}.
            </p>
          </div>
          {/* Quick Action Button */}
          {isAdvertiser && (
            <Link href="/register-item">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Advertise New Item
              </Button>
            </Link>
          )}
          {isExplorer && (
            <Link href="/search">
              <Button>
                <Search className="mr-2 h-4 w-4" /> Browse Items
              </Button>
            </Link>
          )}
        </header>

        {/* Grid for Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Wallet Card (Advertiser Only) */}
          {isAdvertiser && (
            <Card className="bg-white dark:bg-zinc-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Wallet Balance
                </CardTitle>
                <DollarSign className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                  ₹{walletBalance?.toFixed(2) || "0.00"}
                </div>
                <Link
                  href="/wallet"
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400 mt-1 block"
                >
                  Manage Wallet &rarr;
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Messages Card */}
          <Card className="bg-white dark:bg-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Messages
              </CardTitle>
              <MessageSquare
                className={`h-5 w-5 ${
                  unreadMessages > 0
                    ? "text-red-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {unreadMessages || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {unreadMessages > 0
                  ? "New unread messages"
                  : "No unread messages"}
              </p>
              <Link
                href="/messages"
                className="text-xs text-blue-600 hover:underline dark:text-blue-400 mt-1 block"
              >
                View Messages &rarr;
              </Link>
            </CardContent>
          </Card>

          {/* Your Listings Card (Advertiser Only) */}
          {isAdvertiser && (
            <Card className="bg-white dark:bg-zinc-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Active Items
                </CardTitle>
                <ShoppingCart className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                  {userItemsCount || 0}
                </div>
                <Link
                  href="/my-listings"
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400 mt-1 block"
                >
                  View Details &rarr;
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Section for Carousels */}
        <section className="space-y-8">
          {/* Books/Stationary Carousel */}
          <ServiceCarousel
            title="Books & Stationary"
            items={approvedStationary}
            itemType="Stationary"
            emptyMessage="No stationary items available at your college yet"
            searchLink="/search?type=Stationary"
          />

          {/* Flats/PG Carousel */}
          <ServiceCarousel
            title="Flats & PGs"
            items={approvedFlats}
            icon={<Building2 className="h-5 w-5 mr-2" />}
            itemType="Flat/PG"
            emptyMessage="No flats or PGs available at your college yet"
            searchLink="/search?type=Flat/PG"
          />

          {/* Events Carousel */}
          <ServiceCarousel
            title="Events"
            items={approvedEvents}
            icon={<CalendarDays className="h-5 w-5 mr-2" />}
            itemType="Event"
            emptyMessage="No events available at your college yet"
            searchLink="/search?type=Event"
          />

          {/* Restaurants Carousel */}
          <ServiceCarousel
            title="Restaurants"
            items={approvedRestaurants}
            icon={<UtensilsCrossed className="h-5 w-5 mr-2" />}
            itemType="Restaurant"
            emptyMessage="No restaurants available at your college yet"
            searchLink="/search?type=Restaurant"
          />
        </section>
      </div>
    </div>
  );
}
