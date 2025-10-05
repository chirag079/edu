import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Event } from "@/lib/models/event.schema";
import { getServerSession } from "@/auth";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get("collegeId");
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = { college: collegeId };

    if (category) {
      query.category = category;
    }
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }

    const events = await Event.find(query)
      .populate("college", "name")
      .populate("createdBy", "name username")
      .sort({ startDate: 1 });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to create an event" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await request.json();

    const event = new Event({
      ...body,
      createdBy: session.user.id,
    });

    await event.save();

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
