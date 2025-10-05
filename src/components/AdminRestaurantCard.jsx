"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { approveRestaurant, rejectRestaurant } from "@/actions/admin.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Clock, MapPin, Phone, Utensils, X } from "lucide-react";

export function AdminRestaurantCard({ restaurant }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      const result = await approveRestaurant(restaurant._id);
      if (result.success) {
        toast.success("Restaurant approved successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to approve restaurant");
      }
    } catch (error) {
      toast.error("An error occurred while approving the restaurant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);
      const result = await rejectRestaurant(restaurant._id);
      if (result.success) {
        toast.success("Restaurant rejected successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to reject restaurant");
      }
    } catch (error) {
      toast.error("An error occurred while rejecting the restaurant");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{restaurant.name}</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleApprove}
              disabled={isLoading}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading}
            >
              Reject
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <Utensils className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{restaurant.description}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="text-sm">{restaurant.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Utensils className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Cuisine</p>
              <p className="text-sm">{restaurant.cuisine}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Opening Hours</p>
              <p className="text-sm">{restaurant.openingHours}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="text-sm">{restaurant.contact}</p>
            </div>
          </div>

          {restaurant.features && restaurant.features.length > 0 && (
            <div className="flex items-start gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Features</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {restaurant.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
