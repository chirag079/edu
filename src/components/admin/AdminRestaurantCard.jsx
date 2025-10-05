"use client";

import { useState } from "react";
import { MapPinIcon, PhoneIcon, StarIcon, UtensilsIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  approveRestaurant,
  rejectRestaurant,
} from "@/actions/restaurant.actions";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function AdminRestaurantCard({ restaurant }) {
  const [isPending, setIsPending] = useState(false);

  const handleApprove = async () => {
    try {
      setIsPending(true);
      const result = await approveRestaurant(restaurant._id);
      if (result.success) {
        toast.success("Restaurant approved successfully");
        // Remove card from UI
        setTimeout(() => {
          document.getElementById(
            `restaurant-${restaurant._id}`
          ).style.display = "none";
        }, 1000);
      } else {
        toast.error(result.error || "Failed to approve restaurant");
      }
    } catch (error) {
      console.error("Error approving restaurant:", error);
      toast.error("An error occurred while approving the restaurant");
    } finally {
      setIsPending(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsPending(true);
      const result = await rejectRestaurant(restaurant._id);
      if (result.success) {
        toast.success("Restaurant rejected");
        // Remove card from UI
        setTimeout(() => {
          document.getElementById(
            `restaurant-${restaurant._id}`
          ).style.display = "none";
        }, 1000);
      } else {
        toast.error(result.error || "Failed to reject restaurant");
      }
    } catch (error) {
      console.error("Error rejecting restaurant:", error);
      toast.error("An error occurred while rejecting the restaurant");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card id={`restaurant-${restaurant._id}`} className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          {restaurant.imageUrl ? (
            <Image
              src={restaurant.imageUrl}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <UtensilsIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Link
            href={`/restaurant/${restaurant._id}`}
            className="hover:underline"
          >
            <h3 className="font-semibold text-xl line-clamp-1">
              {restaurant.name}
            </h3>
          </Link>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPinIcon className="h-4 w-4" />
              <span className="line-clamp-1">{restaurant.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <PhoneIcon className="h-4 w-4" />
              <span>{restaurant.contactNumber || "N/A"}</span>
            </div>

            {restaurant.averagePrice && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Avg. Price:</span>
                <span>{formatPrice(restaurant.averagePrice)}</span>
              </div>
            )}

            {restaurant.rating && (
              <div className="flex items-center gap-1 text-sm">
                <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span>{restaurant.rating}</span>
              </div>
            )}
          </div>

          <div className="line-clamp-2 text-sm text-muted-foreground mt-2">
            {restaurant.description}
          </div>

          <div className="mt-2">
            <Badge variant="outline" className="mr-1">
              {restaurant.college}
            </Badge>
            <Badge variant="outline">{restaurant.cuisine}</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="default"
          className="w-full"
          onClick={handleApprove}
          disabled={isPending}
        >
          Approve
        </Button>
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleReject}
          disabled={isPending}
        >
          Reject
        </Button>
      </CardFooter>
    </Card>
  );
}
