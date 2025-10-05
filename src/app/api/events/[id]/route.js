import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db";
import mongoose from "mongoose";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Get current user session to check if admin
    const session = await auth();
    const isAdmin = session?.user?.role === "admin";
    const currentUserId = session?.user?.id;

    // Validate the ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid event ID provided" },
        { status: 400 }
      );
    }

    await connectToDb();

    // Import the Event model dynamically
    const { Event } = await import("@/lib/models/event.schema.js");

    // Find the event by ID
    const event = await Event.findById(id)
      .populate("createdBy", "username name email") // Populate creator info
      .lean();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Only return non-approved events if:
    // 1. User is an admin
    // 2. User is the creator of the event
    const isCreator =
      currentUserId &&
      event.createdBy &&
      event.createdBy._id &&
      event.createdBy._id.toString() === currentUserId;

    if (event.status !== "approved" && !isAdmin && !isCreator) {
      return NextResponse.json(
        { error: "Event not available" },
        { status: 403 }
      );
    }

    // Transform the event data for client-side consumption
    const transformedEvent = {
      ...event,
      id: event._id.toString(),
      _id: event._id.toString(),
      createdBy: event.createdBy
        ? {
            id: event.createdBy._id.toString(),
            username: event.createdBy.username,
            name: event.createdBy.name,
            email: event.createdBy.email,
          }
        : null,
      createdAt: event.createdAt ? event.createdAt.toISOString() : null,
      updatedAt: event.updatedAt ? event.updatedAt.toISOString() : null,
      startDate: event.startDate ? event.startDate.toISOString() : null,
      endDate: event.endDate ? event.endDate.toISOString() : null,
    };

    return NextResponse.json(transformedEvent);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event details" },
      { status: 500 }
    );
  }
}
