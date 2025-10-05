import { getListingById } from "@/actions/listing.actions";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import ListingDetailImage from "@/components/ListingDetailImage";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IndianRupee,
  CalendarDays,
  MapPin,
  UserCircle,
  Clock,
  BedDouble,
  Bath,
  Tag,
  NotebookText,
  Info,
  ShieldAlert,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ContactAdvertiser from "@/components/ContactAdvertiser";
// TODO: Import ChatButton or similar component when available
// TODO: Import SaveButton component

// Helper to format date
const formatDate = (dateString, options = {}) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-IN", options);
  } catch (e) {
    return "Invalid Date";
  }
};

// Helper to format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return null;
  return `₹${amount.toLocaleString("en-IN")}`;
};

export default async function ListingDetailPage({ params }) {
  const listingId = params.id;

  // Get current user session
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  const currentUserId = session?.user?.id;

  const listing = await getListingById(listingId);

  if (!listing) {
    notFound(); // Trigger 404 page if listing not found
  }

  // Check if user can view this listing
  const isCreator =
    currentUserId &&
    listing.advertiserId &&
    listing.advertiserId._id &&
    listing.advertiserId._id === currentUserId;

  // Only allow viewing non-approved listings if user is admin or creator
  if (listing.status !== "approved" && !isAdmin && !isCreator) {
    // Redirect with appropriate message
    return redirect("/search?error=ListingNotAvailable");
  }

  const placeholderImage = "/placeholder-image.png"; // Keep this if needed elsewhere, or remove if only used by image

  // --- Render Specific Details based on Type ---
  const renderSpecificDetails = () => {
    switch (listing.itemType) {
      case "Book":
      case "Stationary":
        return (
          <div className="space-y-1 text-sm">
            <p className="flex items-center">
              <Tag className="h-4 w-4 mr-2 text-primary" />{" "}
              <strong>Price:</strong>{" "}
              <span className="ml-1 font-semibold text-lg text-primary">
                {formatCurrency(listing.price)}
              </span>
            </p>
            {listing.mrp && (
              <p className="flex items-center text-gray-600 dark:text-gray-400">
                <Info className="h-4 w-4 mr-2" /> <strong>MRP:</strong>{" "}
                <span className="ml-1 line-through">
                  {formatCurrency(listing.mrp)}
                </span>
              </p>
            )}
          </div>
        );
      case "Flat/PG":
        return (
          <div className="space-y-1 text-sm">
            <p className="flex items-center">
              <IndianRupee className="h-4 w-4 mr-2 text-primary" />{" "}
              <strong>Rent:</strong>{" "}
              <span className="ml-1 font-semibold text-lg text-primary">
                {formatCurrency(listing.rent)}/mo
              </span>
            </p>
            {listing.location && (
              <p className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" /> <strong>Location:</strong>{" "}
                <span className="ml-1">{listing.location}</span>
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
              {listing.bedrooms && (
                <p className="flex items-center">
                  <BedDouble className="h-4 w-4 mr-1" /> {listing.bedrooms}{" "}
                  Bedrooms
                </p>
              )}
              {listing.bathrooms && (
                <p className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" /> {listing.bathrooms}{" "}
                  Bathrooms
                </p>
              )}
            </div>
          </div>
        );
      case "Restaurant":
        return (
          <div className="space-y-1 text-sm">
            {listing.restaurantDetails && (
              <p className="flex items-start">
                <NotebookText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />{" "}
                <strong>Details:</strong>{" "}
                <span className="ml-1 whitespace-pre-wrap">
                  {listing.restaurantDetails}
                </span>
              </p>
            )}
          </div>
        );
      case "Event":
        return (
          <div className="space-y-1 text-sm">
            <p className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2 text-primary" />{" "}
              <strong>Date:</strong>{" "}
              <span className="ml-1 font-semibold text-lg text-primary">
                {formatDate(listing.eventDate, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-900/50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
        {/* Status Banner for non-approved listings */}
        {listing.status !== "approved" && (
          <div
            className={`w-full py-2 px-4 text-center font-medium 
            ${
              listing.status === "pending"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
            }`}
          >
            <ShieldAlert className="inline-block h-4 w-4 mr-1" />
            This listing is currently {listing.status} and not visible to
            regular users
          </div>
        )}

        {/* Image Section - Use the new Client Component */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gray-200 dark:bg-zinc-700">
          <ListingDetailImage src={listing.imageUrl} alt={listing.title} />
        </div>

        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                {listing.itemType}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                {listing.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {listing.college}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2 flex-shrink-0">
              {/* TODO: Add Save Button Here */}
              {/* <SaveButton listingId={listing.id} /> */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap">
                <Clock className="inline h-3 w-3 mr-1" />
                Listed{" "}
                {formatDistanceToNow(new Date(listing.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          {/* Advertiser Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <UserCircle className="h-4 w-4" />
            <span>Posted by {listing.advertiserId.name || "Anonymous"}</span>
            <span>•</span>
            <Clock className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(listing.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Specific Details Section - Rendered by helper */}
          <div className="border-t border-b dark:border-zinc-700 py-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Details
            </h2>
            {renderSpecificDetails()}
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <ContactAdvertiser listing={listing} />
          </div>
        </div>
      </div>
    </div>
  );
}
