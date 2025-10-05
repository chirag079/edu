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
        { error: "Invalid restaurant ID provided" },
        { status: 400 }
      );
    }

    await connectToDb();

    // Import the Restaurant model dynamically
    const { Restaurant } = await import("@/lib/models/restaurant.schema.js");

    // Find the restaurant by ID
    const restaurant = await Restaurant.findById(id)
      .populate("createdBy", "username name email") // Populate creator info
      .lean();

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Only return non-approved restaurants if:
    // 1. User is an admin
    // 2. User is the creator of the restaurant
    const isCreator =
      currentUserId &&
      restaurant.createdBy &&
      restaurant.createdBy._id &&
      restaurant.createdBy._id.toString() === currentUserId;

    if (restaurant.status !== "approved" && !isAdmin && !isCreator) {
      return NextResponse.json(
        { error: "Restaurant not available" },
        { status: 403 }
      );
    }

    // Transform the restaurant data for client-side consumption
    const transformedRestaurant = {
      ...restaurant,
      id: restaurant._id.toString(),
      _id: restaurant._id.toString(),
      createdBy: restaurant.createdBy
        ? {
            id: restaurant.createdBy._id.toString(),
            username: restaurant.createdBy.username,
            name: restaurant.createdBy.name,
            email: restaurant.createdBy.email,
          }
        : null,
      createdAt: restaurant.createdAt
        ? restaurant.createdAt.toISOString()
        : null,
      updatedAt: restaurant.updatedAt
        ? restaurant.updatedAt.toISOString()
        : null,
    };

    return NextResponse.json(transformedRestaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant details" },
      { status: 500 }
    );
  }
}
