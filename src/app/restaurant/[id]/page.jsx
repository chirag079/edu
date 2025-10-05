"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Star,
  Tag,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

// Function to fetch restaurant by ID (client-side)
async function fetchRestaurantById(restaurantId) {
  try {
    const response = await fetch(`/api/restaurants/${restaurantId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch restaurant");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return null;
  }
}

export default function RestaurantDetailPage({ params }) {
  const router = useRouter();
  const restaurantId = params.id;

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function loadRestaurant() {
      try {
        setLoading(true);
        const data = await fetchRestaurantById(restaurantId);
        if (data) {
          setRestaurant(data);
        } else {
          setError("Restaurant not found");
        }
      } catch (err) {
        setError("Failed to load restaurant details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (restaurantId) {
      loadRestaurant();
    }
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          {error || "Restaurant not found"}
        </h1>
        <Button onClick={() => router.push("/search")}>Back to Search</Button>
      </div>
    );
  }

  // Format time for display if needed
  const formatHours = (hoursObj) => {
    if (!hoursObj) return "Hours not available";

    try {
      return `${hoursObj.open} - ${hoursObj.close}`;
    } catch (e) {
      return "Hours not available";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Restaurant Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              Restaurant
            </Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              <Clock className="inline-block h-4 w-4 mr-1" />
              Listed{" "}
              {formatDistanceToNow(new Date(restaurant.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            {restaurant.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-600 dark:text-gray-300">
            {restaurant.address && (
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                <span>{restaurant.address}</span>
              </div>
            )}

            {restaurant.rating > 0 && (
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                <span className="font-medium">
                  {restaurant.rating.toFixed(1)}/5
                </span>
              </div>
            )}

            {restaurant.cuisine && restaurant.cuisine.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {restaurant.cuisine.map((cuisine, index) => (
                  <Badge key={index} variant="outline">
                    {cuisine}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Main Content - 2/3 width on desktop */}
          <div className="md:col-span-2 space-y-6">
            {/* Restaurant Images */}
            {restaurant.images && restaurant.images.length > 0 ? (
              <div className="space-y-2">
                <div className="relative w-full aspect-video bg-gray-200 dark:bg-zinc-800 rounded-lg overflow-hidden">
                  <Image
                    src={restaurant.images[activeImageIndex]}
                    alt={`${restaurant.name} - Image ${activeImageIndex + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.png";
                    }}
                  />
                </div>

                {restaurant.images.length > 1 && (
                  <div className="flex overflow-x-auto space-x-2 py-1">
                    {restaurant.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative min-w-[100px] h-16 rounded-md overflow-hidden ${
                          activeImageIndex === index
                            ? "ring-2 ring-primary"
                            : "opacity-70"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                <MapPin className="h-16 w-16 text-gray-400" />
              </div>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Restaurant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">
                    {restaurant.description}
                  </p>
                </div>

                {/* Features */}
                {restaurant.features && restaurant.features.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 width on desktop */}
          <div className="space-y-6">
            {/* Contact & Hours Card */}
            <Card>
              <CardHeader>
                <CardTitle>Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* College */}
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    College
                  </p>
                  <p>{restaurant.college}</p>
                </div>

                {/* Opening Hours */}
                {restaurant.openingHours &&
                  Object.keys(restaurant.openingHours).length > 0 && (
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Opening Hours
                      </p>
                      <div className="space-y-1 text-sm">
                        {Object.entries(restaurant.openingHours).map(
                          ([day, hours]) => (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize">{day}</span>
                              <span>{formatHours(hours)}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Contact Information */}
                {restaurant.contact &&
                  Object.values(restaurant.contact).some(Boolean) && (
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Information
                      </p>
                      <div className="space-y-1 text-sm">
                        {restaurant.contact.phone && (
                          <p className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-primary" />
                            <a
                              href={`tel:${restaurant.contact.phone}`}
                              className="hover:underline"
                            >
                              {restaurant.contact.phone}
                            </a>
                          </p>
                        )}
                        {restaurant.contact.email && (
                          <p className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-primary" />
                            <a
                              href={`mailto:${restaurant.contact.email}`}
                              className="hover:underline"
                            >
                              {restaurant.contact.email}
                            </a>
                          </p>
                        )}
                        {restaurant.contact.website && (
                          <p className="flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-primary" />
                            <a
                              href={restaurant.contact.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline truncate"
                            >
                              {restaurant.contact.website.replace(
                                /^https?:\/\//,
                                ""
                              )}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      // In a real app, implement sharing functionality
                      window.alert("Share functionality would go here");
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Back to Restaurants Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/search?itemType=Restaurant")}
            >
              View All Restaurants
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
