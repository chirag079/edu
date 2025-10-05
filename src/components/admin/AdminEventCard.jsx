"use client";

import { useState } from "react";
import { CalendarIcon, MapPinIcon, TimerIcon, UsersIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { approveEvent, rejectEvent } from "@/actions/event.actions";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function AdminEventCard({ event }) {
  const [isPending, setIsPending] = useState(false);

  const handleApprove = async () => {
    try {
      setIsPending(true);
      const result = await approveEvent(event._id);
      if (result.success) {
        toast.success("Event approved successfully");
        // Remove card from UI
        setTimeout(() => {
          document.getElementById(`event-${event._id}`).style.display = "none";
        }, 1000);
      } else {
        toast.error(result.error || "Failed to approve event");
      }
    } catch (error) {
      console.error("Error approving event:", error);
      toast.error("An error occurred while approving the event");
    } finally {
      setIsPending(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsPending(true);
      const result = await rejectEvent(event._id);
      if (result.success) {
        toast.success("Event rejected");
        // Remove card from UI
        setTimeout(() => {
          document.getElementById(`event-${event._id}`).style.display = "none";
        }, 1000);
      } else {
        toast.error(result.error || "Failed to reject event");
      }
    } catch (error) {
      console.error("Error rejecting event:", error);
      toast.error("An error occurred while rejecting the event");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card id={`event-${event._id}`} className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Link href={`/event/${event._id}`} className="hover:underline">
            <h3 className="font-semibold text-xl line-clamp-1">
              {event.title}
            </h3>
          </Link>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4" />
              <span>{formatDate(event.date)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <TimerIcon className="h-4 w-4" />
              <span>{event.time}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPinIcon className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <UsersIcon className="h-4 w-4" />
              <span>{event.organizerName}</span>
            </div>
          </div>

          <div className="line-clamp-2 text-sm text-muted-foreground mt-2">
            {event.description}
          </div>

          <div className="mt-2">
            <Badge variant="outline" className="mr-1">
              {event.college}
            </Badge>
            <Badge variant="outline">{event.category}</Badge>
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
