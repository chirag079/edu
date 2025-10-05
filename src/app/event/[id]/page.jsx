"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import {
  Loader2,
  Calendar,
  MapPin,
  User,
  Tag,
  Clock,
  Link as LinkIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Function to fetch event by ID (client-side)
async function fetchEventById(eventId) {
  try {
    const response = await fetch(`/api/events/${eventId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch event");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export default function EventDetailPage({ params }) {
  const router = useRouter();
  const eventId = params.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        const data = await fetchEventById(eventId);
        if (data) {
          setEvent(data);
        } else {
          setError("Event not found");
        }
      } catch (err) {
        setError("Failed to load event details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          {error || "Event not found"}
        </h1>
        <Button onClick={() => router.push("/search")}>Back to Search</Button>
      </div>
    );
  }

  // Format dates for display
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  const formatDate = (date) => {
    return format(date, "PPP"); // e.g. "April 29th, 2023"
  };

  const formatTime = (date) => {
    return format(date, "p"); // e.g. "12:00 PM"
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Event Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {event.category}
            </Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              <Clock className="inline-block h-4 w-4 mr-1" />
              Posted {new Date(event.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            {event.title}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4 text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              <span>
                {formatDate(startDate)}
                {endDate &&
                  endDate.toDateString() !== startDate.toDateString() &&
                  ` - ${formatDate(endDate)}`}
              </span>
            </div>

            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              <span>
                {formatTime(startDate)}
                {endDate && ` - ${formatTime(endDate)}`}
              </span>
            </div>

            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              <span>{event.location}</span>
            </div>

            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              <span>{event.organizer}</span>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Main Content - 2/3 width on desktop */}
          <div className="md:col-span-2 space-y-6">
            {/* Event Image */}
            {event.images && event.images.length > 0 ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-800">
                <Image
                  src={event.images[0]}
                  alt={event.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder-image.png";
                  }}
                />
              </div>
            ) : (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                <Calendar className="h-16 w-16 text-gray-400" />
              </div>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{event.description}</p>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 width on desktop */}
          <div className="space-y-6">
            {/* Registration/Price Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.price > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Price
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      ₹{event.price}
                    </p>
                  </div>
                )}

                {event.registrationRequired && (
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Registration Required
                    </p>
                    {event.registrationLink && (
                      <Button className="w-full" asChild>
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Register Now
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {event.maxParticipants > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Capacity
                    </p>
                    <p>{event.maxParticipants} participants</p>
                  </div>
                )}

                {/* College */}
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    College
                  </p>
                  <p>{event.college}</p>
                </div>

                {/* Contact Information */}
                {event.contact &&
                  Object.values(event.contact).some(Boolean) && (
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Information
                      </p>
                      <div className="space-y-1 text-sm">
                        {event.contact.email && (
                          <p>
                            <strong>Email:</strong>{" "}
                            <a
                              href={`mailto:${event.contact.email}`}
                              className="text-primary"
                            >
                              {event.contact.email}
                            </a>
                          </p>
                        )}
                        {event.contact.phone && (
                          <p>
                            <strong>Phone:</strong>{" "}
                            <a
                              href={`tel:${event.contact.phone}`}
                              className="text-primary"
                            >
                              {event.contact.phone}
                            </a>
                          </p>
                        )}
                        {event.contact.website && (
                          <p>
                            <strong>Website:</strong>{" "}
                            <a
                              href={event.contact.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary"
                            >
                              Visit Website
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Back to Events Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/search?itemType=Event")}
            >
              View All Events
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
