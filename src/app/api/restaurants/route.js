import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Restaurant } from "@/lib/models/restaurant.schema";
import { getServerSession } from "@/auth";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get("collegeId");
    const cuisine = searchParams.get("cuisine");
    const priceRange = searchParams.get("priceRange");
    const rating = searchParams.get("rating");

    let query = { college: collegeId };

    if (cuisine) {
      query.cuisine = cuisine;
    }
    if (priceRange) {
      query.priceRange = priceRange;
    }
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    const restaurants = await Restaurant.find(query)
      .populate("college", "name")
      .populate("createdBy", "name username")
      .sort({ rating: -1, createdAt: -1 });

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to create a restaurant" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await request.json();

    const restaurant = new Restaurant({
      ...body,
      createdBy: session.user.id,
    });

    await restaurant.save();

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { error: "Failed to create restaurant" },
      { status: 500 }
    );
  }
}
