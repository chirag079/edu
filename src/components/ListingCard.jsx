import Link from "next/link";
import Image from "next/image"; // Using next/image for optimization
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IndianRupee, MapPin, CalendarDays, Star } from "lucide-react";

// Helper function to format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "N/A";
  return `₹${amount.toLocaleString("en-IN")}`;
};

// Helper function to format dates (simple)
const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString("en-IN");
  } catch (e) {
    return "Invalid Date";
  }
};

export default function ListingCard({ listing, children }) {
  // Default image placeholder (replace with a better one if available)
  const placeholderImage = "/placeholder-image.png"; // You might need to add this image to your public folder

  // Determine price/rent display
  let priceDisplay = "N/A";
  if (listing.itemType === "Book" || listing.itemType === "Stationary") {
    priceDisplay = formatCurrency(listing.price);
  } else if (listing.itemType === "Flat/PG") {
    priceDisplay = `${formatCurrency(listing.rent)}/mo`;
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 dark:bg-zinc-800">
      <Link href={`/listing/${listing.id}`} className="block">
        <div className="relative w-full h-48 bg-gray-200 dark:bg-zinc-700">
          <Image
            src={listing.imageUrl || placeholderImage}
            alt={listing.title}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            onError={(e) => {
              e.target.src = placeholderImage;
            }} // Fallback to placeholder on error
          />
        </div>
      </Link>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold hover:text-primary transition-colors">
          <Link href={`/listing/${listing.id}`}>{listing.title}</Link>
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
          {listing.itemType} - {listing.college}
          {listing.eventDate && (
            <span className="flex items-center mt-1">
              <CalendarDays className="h-4 w-4 mr-1" />{" "}
              {formatDate(listing.eventDate)}
            </span>
          )}
          {/* Add location for Flats/PGs if available */}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-3">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {listing.description}
        </p>
        {/* Display Price/Rent */}
        {(listing.price !== undefined || listing.rent !== undefined) && (
          <div className="mt-2 text-lg font-bold text-primary flex items-center">
            <IndianRupee className="h-5 w-5 mr-1" /> {priceDisplay}
          </div>
        )}
        {/* TODO: Add Rating Display */}
        {/* <div className="flex items-center mt-1">
                     <Star className="h-4 w-4 text-yellow-400 mr-1" />
                     <span className="text-sm text-gray-600 dark:text-gray-300">{listing.averageRating?.toFixed(1) ?? 'N/A'} ({listing.numberOfRatings ?? 0})</span>
                 </div> */}
      </CardContent>
      <CardFooter className="pt-0 border-t dark:border-zinc-700 p-4">
        {/* Children prop allows adding custom buttons like 'Unsave' */}
        {children ? (
          children
        ) : (
          <Link href={`/listing/${listing.id}`} className="w-full">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
