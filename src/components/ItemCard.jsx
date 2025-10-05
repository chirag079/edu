"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { IndianRupee, CalendarDays, Tag } from "lucide-react";

// Helper to format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return null;
  return `₹${amount.toLocaleString("en-IN")}`;
};

export default function ItemCard({ item }) {
  if (!item) {
    return null;
  }

  const placeholderImage = "/placeholder-image.png";
  const imageUrl =
    item.imageUrl || (item.images && item.images[0]) || placeholderImage;

  // Determine link based on item type
  let itemLink = "/";
  if (item.id) {
    if (item.itemType === "Event") {
      itemLink = `/event/${item.id}`;
    } else if (item.itemType === "Restaurant") {
      itemLink = `/restaurant/${item.id}`;
    } else {
      itemLink = `/listing/${item.id}`;
    }
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden dark:bg-zinc-800 shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link href={itemLink} className="block group">
        <div className="relative w-full h-48 bg-gray-200 dark:bg-zinc-700 overflow-hidden">
          <Image
            src={imageUrl}
            alt={item.title || item.name || "Item"}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-105 transition-transform duration-300 ease-in-out"
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />
        </div>
      </Link>
      <CardHeader className="pb-2 pt-4 px-4">
        <Link href={itemLink} className="block">
          <CardTitle className="text-lg font-semibold leading-tight hover:text-primary dark:hover:text-primary-foreground truncate">
            {item.title || item.name || "Untitled Item"}
          </CardTitle>
        </Link>
        <div className="flex justify-between items-center pt-1">
          <Badge variant="secondary" className="text-xs">
            {item.itemType || "Item"}
          </Badge>
          {item.college && (
            <Badge variant="outline" className="text-xs">
              {item.college}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow px-4 py-2">
        {(item.itemType === "Book" || item.itemType === "Stationary") &&
          item.price && (
            <p className="text-lg font-bold text-primary dark:text-primary-foreground flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              {formatCurrency(item.price)}
            </p>
          )}
        {item.itemType === "Flat/PG" && item.rent && (
          <p className="text-lg font-bold text-primary dark:text-primary-foreground flex items-center">
            <IndianRupee className="h-4 w-4 mr-1" />
            {formatCurrency(item.rent)}/mo
          </p>
        )}
        {item.itemType === "Event" && item.startDate && (
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <CalendarDays className="h-4 w-4 mr-1" />
            {new Date(item.startDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </p>
        )}
        {item.itemType === "Restaurant" &&
          item.cuisine &&
          item.cuisine.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {Array.isArray(item.cuisine)
                ? item.cuisine.join(", ")
                : item.cuisine}
            </p>
          )}

        {!(
          (item.itemType === "Book" || item.itemType === "Stationary") &&
          item.price
        ) &&
          !(item.itemType === "Flat/PG" && item.rent) &&
          !(item.itemType === "Event" && item.startDate) &&
          !(item.itemType === "Restaurant" && item.cuisine?.length > 0) &&
          item.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-2">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={itemLink}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
