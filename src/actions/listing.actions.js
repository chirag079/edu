"use server";

import { connectToDb } from "@/lib/db";
import { Listing } from "@/lib/models/listing.schema.js";
import { User } from "@/lib/models/user.schema.js";
import mongoose from "mongoose";
import { auth } from "@/auth"; // To get current user session
import { calculateAdvertisingCost } from "@/lib/utils/costUtils"; // Import cost calculator
import { deductFundsForListing } from "./wallet.actions"; // Import fund deduction
import { revalidatePath } from "next/cache"; // To potentially refresh admin page

/**
 * Fetches listings for a given college and optional type.
 * @param {string} college - The college to filter by.
 * @param {string} [type] - Optional listing type (e.g., 'Book', 'Flat/PG', 'Event').
 * @param {number} [limit=5] - Max number of listings to return.
 * @returns {Promise<Array<object>>} - A promise resolving to an array of listings.
 */
export async function getListingsByCollege(college, itemType, limit = 5) {
  if (!college) return [];
  try {
    await connectToDb();
    const query = {
      college: college,
      isActive: true, // Only fetch active listings
      status: "approved", // Only fetch approved listings
      // Potentially filter out expired listings if expiresAt is used
      // expiresAt: { $gt: new Date() }
    };
    if (itemType) {
      query.itemType = itemType;
    }
    const listings = await Listing.find(query)
      .sort({ createdAt: -1 }) // Show newest first
      .limit(limit)
      .populate("advertiserId", "username name") // Optionally populate advertiser info
      .lean(); // Use lean for performance

    // Convert ObjectId to string for client components
    return listings.map((listing) => ({
      ...listing,
      _id: listing._id.toString(),
      id: listing._id.toString(), // Add 'id' for convenience if needed by components
      advertiserId: listing.advertiserId?._id
        ? {
            _id: listing.advertiserId._id.toString(),
            username: listing.advertiserId.username,
            name: listing.advertiserId.name,
          }
        : null,
    }));
  } catch (error) {
    console.error(`Error fetching listings for college ${college}:`, error);
    return []; // Return empty array on error
  }
}

/**
 * Fetches the count of active listings for a specific user.
 */
export async function getUserListingsCount(userId) {
  if (!userId) return 0;

  let userObjectId;
  try {
    userObjectId = new mongoose.Types.ObjectId(userId);
  } catch (err) {
    // console.error("Invalid userId for ObjectId conversion:", userId); // Keep error log for this case
    return 0;
  }

  try {
    await connectToDb();
    const count = await Listing.countDocuments({
      advertiserId: userObjectId,
      isActive: true,
      status: "approved", // Only count approved items
    });
    return count;
  } catch (error) {
    console.error(`Error fetching listing count for user ${userId}:`, error);
    return 0;
  }
}

/**
 * Gets the total count of all active items (listings, events, restaurants) for a user
 */
export async function getTotalUserItemsCount(userId) {
  if (!userId) return 0;

  let userObjectId;
  try {
    userObjectId = new mongoose.Types.ObjectId(userId);
  } catch (err) {
    return 0;
  }

  try {
    await connectToDb();

    // Get count from listings
    const listingsPromise = Listing.countDocuments({
      advertiserId: userObjectId,
      status: "approved",
    });

    // Get count from events
    const { Event } = await import("@/lib/models/event.schema.js");
    const eventsPromise = Event.countDocuments({
      createdBy: userObjectId,
      status: "approved",
    });

    // Get count from restaurants
    const { Restaurant } = await import("@/lib/models/restaurant.schema.js");
    const restaurantsPromise = Restaurant.countDocuments({
      createdBy: userObjectId,
      status: "approved",
    });

    // Execute all count queries in parallel
    const [listingsCount, eventsCount, restaurantsCount] = await Promise.all([
      listingsPromise,
      eventsPromise,
      restaurantsPromise,
    ]);

    // Return the total count
    return listingsCount + eventsCount + restaurantsCount;
  } catch (error) {
    console.error(
      `Error fetching total items count for user ${userId}:`,
      error
    );
    return 0;
  }
}

/**
 * Fetches the count of saved items for a specific user.
 */
export async function getSavedItemsCount(userId) {
  if (!userId) return 0;
  try {
    await connectToDb();
    // Fetch the user and select only the savedItems array
    const user = await User.findById(userId).select("savedItems").lean();
    // Return the length of the array (or 0 if user/array doesn't exist)
    return user?.savedItems?.length ?? 0;
  } catch (error) {
    console.error(
      `Error fetching saved items count for user ${userId}:`,
      error
    );
    return 0;
  }
}

/**
 * Creates a listing request (status: pending) for Book, Stationary, or Flat/PG items
 * after checking wallet balance and deducting cost.
 * @param {object} formData - Object containing listing details including imageUrl
 * @returns {Promise<object>} - Result object { success: boolean, message: string }
 */
export async function createListingRequest(formData) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Authentication required." };
  }
  if (session.user.role !== "advertiser") {
    return { success: false, message: "Only advertisers can create listings." };
  }
  if (!session.user.isVerified) {
    return {
      success: false,
      message: "Profile must be completed and verified first.",
    };
  }

  const userId = session.user.id;
  const userCollege = session.user.college;
  const itemType = formData.itemType; // Get itemType

  // Validate that itemType is one of the allowed types for this action
  if (!["Stationary", "Flat/PG"].includes(itemType)) {
    return {
      success: false,
      message: `Item type '${itemType}' is not handled by this action.`,
    };
  }

  // Basic validation (Consider Zod) - Ensure required fields for Book/Stationary/FlatPG exist
  if (
    !formData.title ||
    !formData.description ||
    !userCollege ||
    !formData.imageUrl // Added imageUrl check
  ) {
    return {
      success: false,
      message:
        "Missing required listing information (title, description, image) or user college.",
    };
  }
  // Type-specific validation could be added here (e.g., price for Book/Stationary, rent for Flat/PG)

  const mrp = formData.mrp ? parseFloat(formData.mrp) : undefined;
  // Cost calculation might need adjustment if Events/Restaurants have different logic
  const cost = calculateAdvertisingCost(itemType, mrp);

  try {
    await connectToDb();

    // 1. Check wallet balance
    const user = await User.findById(userId).select("wallet.balance").lean();
    const currentBalance = user?.wallet?.balance ?? 0;

    if (currentBalance < cost) {
      return {
        success: false,
        message: `Insufficient wallet balance. Cost: ₹${cost.toFixed(
          2
        )}, Balance: ₹${currentBalance.toFixed(2)}`,
      };
    }

    // 2. Deduct funds (using the existing transaction-safe action)
    const deductionResult = await deductFundsForListing(
      userId,
      cost,
      formData.title
    );
    if (!deductionResult.success) {
      return {
        success: false,
        message: deductionResult.message || "Failed to deduct funds.",
      };
    }

    // 3. Create the listing document (Only for Book, Stationary, Flat/PG)
    const newListingData = {
      title: formData.title,
      description: formData.description,
      itemType: itemType, // Use validated itemType
      imageUrl: formData.imageUrl,
      advertiserId: userId,
      college: userCollege,
      status: "pending",
      calculatedCost: cost,
      isActive: false,
      // Set expiry only for Flat/PG in this context
      expiresAt:
        itemType === "Flat/PG"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // ~30 days expiry
          : null,
      // Add type-specific fields for Book, Stationary, Flat/PG
      mrp: itemType === "Stationary" ? formData.mrp : undefined,
      price: itemType === "Stationary" ? formData.price : undefined,
      rent: itemType === "Flat/PG" ? formData.rent : undefined,
      bedrooms: itemType === "Flat/PG" ? formData.bedrooms : undefined,
      bathrooms: itemType === "Flat/PG" ? formData.bathrooms : undefined,
    };

    const newListing = new Listing(newListingData);
    await newListing.save();

    revalidatePath("/admin/approve-listings"); // Revalidate admin page

    return { success: true, message: "Listing submitted for approval!" };
  } catch (error) {
    console.error("Error creating listing request:", error);
    // TODO: Consider refund logic if deduction succeeded but save failed
    return { success: false, message: "Failed to submit listing request." };
  }
}

/**
 * Fetches all listings created by a specific user.
 * @param {string} userId - The ID of the user (advertiser).
 * @returns {Promise<Array<object>>} - A promise resolving to an array of the user's listings.
 */
export async function getUserListings(userId) {
  if (!userId) return [];

  let userObjectId;
  try {
    userObjectId = new mongoose.Types.ObjectId(userId);
  } catch (err) {
    console.error("Invalid userId for ObjectId conversion:", userId);
    return [];
  }

  try {
    await connectToDb();
    const listings = await Listing.find({ advertiserId: userObjectId })
      .sort({ createdAt: -1 }) // Show newest first
      .lean(); // Use lean for performance

    // Convert ObjectId to string for client components
    return listings.map((listing) => ({
      ...listing,
      _id: listing._id.toString(),
      id: listing._id.toString(), // Add 'id' for convenience
      itemType: listing.itemType, // Add itemType
      advertiserId: listing.advertiserId.toString(), // Explicitly stringify advertiserId
      createdAt: listing.createdAt.toISOString(), // Ensure date is stringified
      updatedAt: listing.updatedAt.toISOString(),
      expiresAt: listing.expiresAt ? listing.expiresAt.toISOString() : null,
    }));
  } catch (error) {
    console.error(`Error fetching listings for user ${userId}:`, error);
    return []; // Return empty array on error
  }
}

/**
 * Fetches a single listing by its ID.
 * @param {string} listingId - The ID of the listing.
 * @returns {Promise<object|null>} - A promise resolving to the listing object or null if not found/error.
 */
export async function getListingById(listingId) {
  if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
    console.error("Invalid listing ID provided:", listingId);
    return null;
  }

  try {
    await connectToDb();
    const listing = await Listing.findById(listingId)
      .populate("advertiserId", "username name email") // Populate advertiser details
      .lean(); // Use lean for performance

    if (!listing) {
      return null; // Not found
    }

    // Sanitize data for client components (especially ObjectIds and Dates)
    return {
      ...listing,
      _id: listing._id.toString(),
      id: listing._id.toString(),
      advertiserId: listing.advertiserId?._id
        ? {
            _id: listing.advertiserId._id.toString(),
            username: listing.advertiserId.username,
            name: listing.advertiserId.name,
            email: listing.advertiserId.email,
          }
        : null,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      expiresAt: listing.expiresAt ? listing.expiresAt.toISOString() : null,
    };
  } catch (error) {
    console.error(`Error fetching listing ${listingId}:`, error);
    return null; // Return null on error
  }
}

/**
 * Searches for approved and active listings based on query and filters.
 * @param {object} params - Search parameters.
 * @param {string} [params.query=''] - Text query to search in title/description.
 * @param {string} [params.college=''] - College filter.
 * @param {string} [params.itemType=''] - Item type filter.
 * @param {number} [params.minPrice] - Minimum price filter.
 * @param {number} [params.maxPrice] - Maximum price filter.
 * @param {number} [limit=20] - Max results to return.
 * @param {number} [page=1] - Page number for pagination.
 * @returns {Promise<Array<object>>} - A promise resolving to an array of matching listings.
 */
export async function searchListings(params = {}, limit = 20, page = 1) {
  const {
    query = "",
    college = "",
    itemType = "",
    minPrice,
    maxPrice,
  } = params;
  const skip = (page - 1) * limit;

  try {
    await connectToDb();

    // Base query for approved listings
    const mongoQuery = {
      status: "approved",
      // expiresAt: { $gt: new Date() } // Optional: Filter out expired if using expiresAt
    };

    // Add college filter if provided
    if (college && ["NSUT", "DTU", "IPU"].includes(college)) {
      mongoQuery.college = college;
    }

    // Add itemType filter if provided
    if (
      itemType &&
      ["Stationary", "Flat/PG", "Restaurant", "Event"].includes(itemType)
    ) {
      mongoQuery.itemType = itemType;
    }

    // Add text search filter if query provided
    if (query) {
      mongoQuery.$text = { $search: query };
      // Ensure you have a text index on title and description in your schema:
      // listingSchema.index({ title: 'text', description: 'text' });
    }

    // Add price/rent filter
    const priceFilter = {};
    if (typeof minPrice === "number" && minPrice >= 0) {
      priceFilter.$gte = minPrice;
    }
    if (typeof maxPrice === "number" && maxPrice >= 0) {
      priceFilter.$lte = maxPrice;
    }
    if (Object.keys(priceFilter).length > 0) {
      // Apply to either price or rent depending on itemType or universally?
      // Simple approach: apply if either field matches. Complex logic might be needed.
      mongoQuery.$or = [{ price: priceFilter }, { rent: priceFilter }];
      // If filtering only specific types:
      /*
             if (itemType === 'Book' || itemType === 'Stationary') {
                  mongoQuery.price = priceFilter;
             } else if (itemType === 'Flat/PG') {
                 mongoQuery.rent = priceFilter;
             }
             */
    }

    const listings = await Listing.find(mongoQuery)
      .sort(query ? { score: { $meta: "textScore" } } : { createdAt: -1 }) // Sort by relevance if searching, else by date
      .skip(skip)
      .limit(limit)
      .populate("advertiserId", "username name") // Populate limited advertiser info
      .lean();

    // Sanitize results
    return listings.map((listing) => ({
      ...listing,
      _id: listing._id.toString(),
      id: listing._id.toString(),
      itemType: listing.itemType, // Add itemType
      advertiserId: listing.advertiserId?._id
        ? {
            _id: listing.advertiserId._id.toString(),
            username: listing.advertiserId.username,
            name: listing.advertiserId.name,
          }
        : null,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      expiresAt: listing.expiresAt ? listing.expiresAt.toISOString() : null,
    }));
  } catch (error) {
    console.error("Error searching listings:", error);
    return [];
  }
}

// =============================================
//         GET USER-SPECIFIC ITEMS
// =============================================

/**
 * Fetches all events created by a specific user.
 * @param {string} userId - The ID of the user (creator).
 * @returns {Promise<Array<object>>} - A promise resolving to an array of the user's events.
 */
export async function getUserEvents(userId) {
  if (!userId) return [];
  let userObjectId;
  try {
    userObjectId = new mongoose.Types.ObjectId(userId);
  } catch (err) {
    console.error("Invalid userId for getUserEvents:", userId);
    return [];
  }

  try {
    await connectToDb();
    const { Event } = await import("@/lib/models/event.schema.js");
    const events = await Event.find({ createdBy: userObjectId })
      .sort({ createdAt: -1 })
      .lean();

    return events.map((event) => ({
      ...event,
      id: event._id.toString(),
      _id: event._id.toString(),
      itemType: "Event", // Add itemType
      createdBy: event.createdBy.toString(),
      createdAt: event.createdAt?.toISOString(),
      updatedAt: event.updatedAt?.toISOString(),
      startDate: event.startDate?.toISOString(),
      endDate: event.endDate?.toISOString(),
    }));
  } catch (error) {
    console.error(`Error fetching events for user ${userId}:`, error);
    return [];
  }
}

/**
 * Fetches all restaurants created by a specific user.
 * @param {string} userId - The ID of the user (creator).
 * @returns {Promise<Array<object>>} - A promise resolving to an array of the user's restaurants.
 */
export async function getUserRestaurants(userId) {
  if (!userId) return [];
  let userObjectId;
  try {
    userObjectId = new mongoose.Types.ObjectId(userId);
  } catch (err) {
    console.error("Invalid userId for getUserRestaurants:", userId);
    return [];
  }

  try {
    await connectToDb();
    const { Restaurant } = await import("@/lib/models/restaurant.schema.js");
    const restaurants = await Restaurant.find({ createdBy: userObjectId })
      .sort({ createdAt: -1 })
      .lean();

    return restaurants.map((restaurant) => ({
      ...restaurant,
      id: restaurant._id.toString(),
      _id: restaurant._id.toString(),
      itemType: "Restaurant", // Add itemType
      createdBy: restaurant.createdBy.toString(),
      createdAt: restaurant.createdAt?.toISOString(),
      updatedAt: restaurant.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error(`Error fetching restaurants for user ${userId}:`, error);
    return [];
  }
}

// =============================================
//       FETCH APPROVED ITEMS FOR DISPLAY
// =============================================

/**
 * Fetches approved listings, optionally filtered by type, sorted by creation date.
 * @param {number} [limit=8] - Max items to return.
 * @param {string|null} [itemType=null] - Specific itemType to filter by (e.g., 'Book', 'Stationary').
 * @param {string|null} [college=null] - Specific college to filter by.
 * @returns {Promise<Array<object>>}
 */
export async function getApprovedListings(
  limit = 8,
  itemType = null,
  college = null
) {
  try {
    await connectToDb();
    const query = { status: "approved" /* , isActive: true */ }; // Removed isActive check
    if (itemType) {
      query.itemType = itemType;
    }
    if (college) {
      query.college = college;
    }

    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("advertiserId", "username name")
      .lean();

    return listings.map((listing) => ({
      ...listing,
      id: listing._id.toString(),
      _id: listing._id.toString(),
      itemType: listing.itemType,
      advertiserId: listing.advertiserId?._id
        ? {
            _id: listing.advertiserId._id.toString(),
            username: listing.advertiserId.username,
            name: listing.advertiserId.name,
          }
        : null,
      createdAt: listing.createdAt?.toISOString(),
      updatedAt: listing.updatedAt?.toISOString(),
      expiresAt: listing.expiresAt?.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching approved listings:", error);
    return [];
  }
}

/**
 * Fetches approved events, sorted by start date (upcoming first) or creation date.
 * @param {number} [limit=8] - Max items to return.
 * @param {string|null} [college=null] - Specific college to filter by.
 * @returns {Promise<Array<object>>}
 */
export async function getApprovedEvents(limit = 8, college = null) {
  try {
    await connectToDb();
    const { Event } = await import("@/lib/models/event.schema.js");
    const query = { status: "approved" };
    // Optionally filter by events starting today or later?
    // query.startDate = { $gte: new Date().setHours(0,0,0,0) };
    if (college) {
      query.college = college;
    }

    const events = await Event.find(query)
      .sort({ startDate: 1 }) // Sort by upcoming start date
      .limit(limit)
      .populate("createdBy", "username name")
      .lean();

    return events.map((event) => ({
      ...event,
      id: event._id.toString(),
      _id: event._id.toString(),
      itemType: "Event",
      createdBy: event.createdBy?._id
        ? {
            _id: event.createdBy._id.toString(),
            username: event.createdBy.username,
            name: event.createdBy.name,
          }
        : null,
      createdAt: event.createdAt?.toISOString(),
      updatedAt: event.updatedAt?.toISOString(),
      startDate: event.startDate?.toISOString(),
      endDate: event.endDate?.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching approved events:", error);
    return [];
  }
}

/**
 * Fetches approved restaurants, sorted by creation date.
 * @param {number} [limit=8] - Max items to return.
 * @param {string|null} [college=null] - Specific college to filter by.
 * @returns {Promise<Array<object>>}
 */
export async function getApprovedRestaurants(limit = 8, college = null) {
  try {
    await connectToDb();
    const { Restaurant } = await import("@/lib/models/restaurant.schema.js");
    const query = { status: "approved" };
    if (college) {
      query.college = college;
    }

    const restaurants = await Restaurant.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("createdBy", "username name")
      .lean();

    return restaurants.map((restaurant) => ({
      ...restaurant,
      id: restaurant._id.toString(),
      _id: restaurant._id.toString(),
      itemType: "Restaurant",
      createdBy: restaurant.createdBy?._id
        ? {
            _id: restaurant.createdBy._id.toString(),
            username: restaurant.createdBy.username,
            name: restaurant.createdBy.name,
          }
        : null,
      createdAt: restaurant.createdAt?.toISOString(),
      updatedAt: restaurant.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching approved restaurants:", error);
    return [];
  }
}

// =============================================
//             UNIFIED SEARCH ACTION
// =============================================

/**
 * Searches across Listings, Events, and Restaurants based on query and filters.
 * @param {object} params - Search parameters.
 * @param {string} [params.query=''] - Text query to search in title/name/description.
 * @param {string} [params.college=''] - College filter.
 * @param {string} [params.itemType=''] - Item type filter (Listing, Event, Restaurant, Book, etc.).
 * @param {number} [limit=20] - Max results to return.
 * @param {number} [page=1] - Page number for pagination.
 * @returns {Promise<Array<object>>} - A promise resolving to an array of matching items.
 */
export async function searchAllItems(params = {}, limit = 20, page = 1) {
  const {
    query = "",
    college = "",
    itemType = "",
    // TODO: Add price/rent/date filters if needed later
  } = params;
  const skip = (page - 1) * limit;

  try {
    await connectToDb();

    let searchPromises = [];

    // Base query for approved, active items
    const baseQuery = { status: "approved" }; // Removed isActive as Events/Restaurants don't have it
    if (college && ["NSUT", "DTU", "IPU"].includes(college)) {
      baseQuery.college = college;
    }

    // --- Prepare Listing Search ---
    const listingTypes = ["Stationary", "Flat/PG"];
    if (!itemType || listingTypes.includes(itemType)) {
      const listingQuery = { ...baseQuery /* , isActive: true */ }; // Removed isActive check
      if (itemType && listingTypes.includes(itemType)) {
        listingQuery.itemType = itemType;
      }
      if (query) {
        listingQuery.$text = { $search: query };
        // Ensure Listing schema has text index: { title: 'text', description: 'text' }
      }

      searchPromises.push(
        Listing.find(listingQuery)
          .sort(query ? { score: { $meta: "textScore" } } : { createdAt: -1 })
          .skip(skip) // Apply pagination individually for now
          .limit(limit)
          .populate("advertiserId", "username name")
          .lean()
          .then((results) =>
            results.map((listing) => ({
              // Sanitize and add type
              ...listing,
              id: listing._id.toString(),
              _id: listing._id.toString(),
              itemType: listing.itemType,
              advertiserId: listing.advertiserId?._id
                ? {
                    _id: listing.advertiserId._id.toString(),
                    username: listing.advertiserId.username,
                    name: listing.advertiserId.name,
                  }
                : null,
              createdAt: listing.createdAt
                ? listing.createdAt.toISOString()
                : null,
              updatedAt: listing.updatedAt
                ? listing.updatedAt.toISOString()
                : null,
              expiresAt: listing.expiresAt
                ? listing.expiresAt.toISOString()
                : null,
            }))
          )
      );
    }

    // --- Prepare Event Search ---
    if (!itemType || itemType === "Event") {
      const { Event } = await import("@/lib/models/event.schema.js");
      const eventQuery = { ...baseQuery };
      if (query) {
        // Basic text search simulation (case-insensitive) on title/description
        const regex = new RegExp(query, "i");
        eventQuery.$or = [{ title: regex }, { description: regex }];
        // For better performance, add text index to Event schema
      }
      searchPromises.push(
        Event.find(eventQuery)
          .sort({ startDate: 1 }) // Sort events by date
          .skip(skip)
          .limit(limit)
          .populate("createdBy", "username name")
          .lean()
          .then((results) =>
            results.map((event) => ({
              // Sanitize and add type
              ...event,
              id: event._id.toString(),
              _id: event._id.toString(),
              itemType: "Event",
              createdBy: event.createdBy?._id
                ? {
                    _id: event.createdBy._id.toString(),
                    username: event.createdBy.username,
                    name: event.createdBy.name,
                  }
                : null,
              createdAt: event.createdAt ? event.createdAt.toISOString() : null,
              updatedAt: event.updatedAt ? event.updatedAt.toISOString() : null,
              startDate: event.startDate ? event.startDate.toISOString() : null,
              endDate: event.endDate ? event.endDate.toISOString() : null,
            }))
          )
      );
    }

    // --- Prepare Restaurant Search ---
    if (!itemType || itemType === "Restaurant") {
      const { Restaurant } = await import("@/lib/models/restaurant.schema.js");
      const restaurantQuery = { ...baseQuery };
      if (query) {
        const regex = new RegExp(query, "i");
        restaurantQuery.$or = [
          { name: regex },
          { description: regex },
          { cuisine: regex },
        ]; // Search name, desc, cuisine
        // For better performance, add text index to Restaurant schema
      }
      searchPromises.push(
        Restaurant.find(restaurantQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("createdBy", "username name")
          .lean()
          .then((results) =>
            results.map((restaurant) => ({
              // Sanitize and add type
              ...restaurant,
              id: restaurant._id.toString(),
              _id: restaurant._id.toString(),
              itemType: "Restaurant",
              createdBy: restaurant.createdBy?._id
                ? {
                    _id: restaurant.createdBy._id.toString(),
                    username: restaurant.createdBy.username,
                    name: restaurant.createdBy.name,
                  }
                : null,
              createdAt: restaurant.createdAt
                ? restaurant.createdAt.toISOString()
                : null,
              updatedAt: restaurant.updatedAt
                ? restaurant.updatedAt.toISOString()
                : null,
            }))
          )
      );
    }

    // --- Execute Searches and Combine ---
    const resultsArrays = await Promise.all(searchPromises);
    const combinedResults = resultsArrays.flat(); // Combine results from all searches

    // Sort combined results (if needed, basic sort by date if no query)
    // Note: Relevance sorting across collections is complex without dedicated search engine
    if (!query) {
      combinedResults.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
    }

    // Apply overall limit (pagination applied individually, so this might not be perfect)
    // A more robust pagination requires aggregation pipeline
    return combinedResults.slice(0, limit);
  } catch (error) {
    console.error("Error searching all items:", error);
    return [];
  }
}

// =============================================
//             CREATE EVENT ACTION
// =============================================

/**
 * Creates an Event request (status: pending? or directly approved? TBD based on schema/requirements)
 * Note: This uses the Event model directly. Cost calculation/deduction needs integration.
 * @param {object} formData - Object containing event details.
 * @returns {Promise<object>} - Result object { success: boolean, message: string }
 */
export async function createEvent(formData) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Authentication required." };
  }
  if (session.user.role !== "advertiser") {
    // Or a different role?
    return { success: false, message: "Permission denied." };
  }
  if (!session.user.isVerified) {
    return {
      success: false,
      message: "Profile must be completed and verified first.",
    };
  }

  const userId = session.user.id;
  const userCollege = session.user.college; // Assuming college comes from session or needs lookup

  // Basic Validation (Update as needed)
  if (
    !formData.title ||
    !formData.description ||
    !formData.startDate ||
    !formData.location ||
    !formData.organizer ||
    !formData.category
  ) {
    return { success: false, message: "Missing required event information." };
  }

  // --- Wallet Balance Check and Deduction ---
  // Assume calculateAdvertisingCost can handle 'Event' type
  const cost = calculateAdvertisingCost("Event"); // Pass 'Event' type, no MRP for events typically

  try {
    await connectToDb();

    // 1. Check wallet balance
    const user = await User.findById(userId).select("wallet.balance").lean();
    const currentBalance = user?.wallet?.balance ?? 0;

    if (currentBalance < cost) {
      return {
        success: false,
        message: `Insufficient wallet balance. Cost: ₹${cost.toFixed(
          2
        )}, Balance: ₹${currentBalance.toFixed(2)}`,
      };
    }

    // 2. Deduct funds (if cost > 0)
    if (cost > 0) {
      const deductionResult = await deductFundsForListing(
        userId,
        cost,
        formData.title // Use event title for transaction description
      );
      if (!deductionResult.success) {
        return {
          success: false,
          message: deductionResult.message || "Failed to deduct funds.",
        };
      }
    }
    // --- End Wallet Logic ---

    // 3. Create the Event document
    const { Event } = await import("@/lib/models/event.schema.js");

    const newEventData = {
      title: formData.title,
      description: formData.description,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate
        ? new Date(formData.endDate)
        : new Date(formData.startDate),
      location: formData.location,
      category: formData.category,
      organizer: formData.organizer,
      images: formData.images || [], // Ensure images is an array
      // Coordinates is optional now, so only include if provided
      coordinates: formData.coordinates || undefined,
      // Pass other fields from form if added
      contact: formData.contact || {},
      registrationRequired: formData.registrationRequired || false,
      registrationLink: formData.registrationLink,
      maxParticipants: formData.maxParticipants,
      price: formData.price || 0,
      tags: formData.tags || [],
      // Add status and cost
      status: "pending",
      calculatedCost: cost,
      createdBy: userId,
      college: userCollege,
      isVerified: false, // Keep isVerified for now, status handles approval flow
    };

    const newEvent = new Event(newEventData);
    await newEvent.save();

    // Revalidate paths to update admin UI
    revalidatePath("/admin/approve-listings");

    console.log("Event created successfully:", newEvent._id.toString());

    return { success: true, message: "Event submitted successfully!" };
  } catch (error) {
    console.error("Error creating event:", error);
    // TODO: Consider refund logic if deduction succeeded but save failed
    return {
      success: false,
      message:
        "Failed to submit event. " +
        (error.message || "Please try again later."),
    };
  }
}

// =============================================
//          CREATE RESTAURANT ACTION
// =============================================

/**
 * Creates a Restaurant entry.
 * Note: This uses the Restaurant model directly. Cost calculation/deduction needs integration.
 * @param {object} formData - Object containing restaurant details.
 * @returns {Promise<object>} - Result object { success: boolean, message: string }
 */
export async function createRestaurant(formData) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Authentication required." };
  }
  if (session.user.role !== "advertiser") {
    // Or a different role?
    return { success: false, message: "Permission denied." };
  }
  if (!session.user.isVerified) {
    return {
      success: false,
      message: "Profile must be completed and verified first.",
    };
  }

  const userId = session.user.id;
  const userCollege = session.user.college; // Assuming college comes from session or needs lookup

  // Validation should be updated to reflect schema changes (no priceRange)
  if (
    !formData.name ||
    !formData.description ||
    !formData.address ||
    !formData.cuisine
  ) {
    return {
      success: false,
      message: "Missing required restaurant information.",
    };
  }

  // --- Wallet Balance Check and Deduction ---
  // Assume calculateAdvertisingCost can handle 'Restaurant' type
  const cost = calculateAdvertisingCost("Restaurant"); // Pass 'Restaurant' type

  try {
    await connectToDb();

    // 1. Check wallet balance
    const user = await User.findById(userId).select("wallet.balance").lean();
    const currentBalance = user?.wallet?.balance ?? 0;

    if (currentBalance < cost) {
      return {
        success: false,
        message: `Insufficient wallet balance. Cost: ₹${cost.toFixed(
          2
        )}, Balance: ₹${currentBalance.toFixed(2)}`,
      };
    }

    // 2. Deduct funds (if cost > 0)
    if (cost > 0) {
      const deductionResult = await deductFundsForListing(
        userId,
        cost,
        formData.name // Use restaurant name for transaction description
      );
      if (!deductionResult.success) {
        return {
          success: false,
          message: deductionResult.message || "Failed to deduct funds.",
        };
      }
    }
    // --- End Wallet Logic ---

    // 3. Create the Restaurant document
    const { Restaurant } = await import("@/lib/models/restaurant.schema.js");

    const newRestaurantData = {
      name: formData.name,
      description: formData.description,
      address: formData.address,
      cuisine: Array.isArray(formData.cuisine)
        ? formData.cuisine
        : [formData.cuisine],
      rating: formData.rating || 0,
      images: formData.images || [], // Ensure images is an array
      // Optional fields - only include if provided
      location: formData.location && {
        type: "Point",
        coordinates: formData.coordinates || [0, 0], // Default if not provided
      },
      openingHours: formData.openingHours || {},
      contact: formData.contact || {},
      features: formData.features || [],
      // Add status and cost
      status: "pending",
      calculatedCost: cost,
      createdBy: userId,
      college: userCollege,
      isVerified: false, // Keep isVerified for now, status handles approval flow
    };

    const newRestaurant = new Restaurant(newRestaurantData);
    await newRestaurant.save();

    // Revalidate admin update page
    revalidatePath("/admin/approve-listings");

    console.log(
      "Restaurant created successfully:",
      newRestaurant._id.toString()
    );

    return { success: true, message: "Restaurant submitted successfully!" };
  } catch (error) {
    console.error("Error creating restaurant:", error);
    // TODO: Consider refund logic if deduction succeeded but save failed
    return {
      success: false,
      message:
        "Failed to submit restaurant. " +
        (error.message || "Please try again later."),
    };
  }
}
