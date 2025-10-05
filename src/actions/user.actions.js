"use server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/db";
import { User } from "@/lib/models/user.schema";
import { Listing } from "@/lib/models/listing.schema";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

export async function fetchUserDataByUsername(username) {
  if (!username) return null;
  try {
    await connectToDb();
    const user = await User.findOne({ username }).lean(); // Use lean for plain object
    if (!user) return null;

    // Convert ObjectId to string if needed for client components
    if (user._id) user._id = user._id.toString();
    // Ensure nested objects are plain if needed
    if (user.wallet && user.wallet._id)
      user.wallet._id = user.wallet._id.toString();
    if (user.wallet && user.wallet.transactions) {
      user.wallet.transactions.forEach((t) => {
        if (t._id) t._id = t._id.toString();
      });
    }
    // Add similar conversions for other ObjectIds if they exist

    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function checkIsRegistered() {
  const session = await auth();
  var userId = session?.user?.id;
  const registration = await User.findById(userId).select({
    registrationCompleted: 1,
  });

  return Boolean(registration?.registrationCompleted);
}

/**
 * Fetches the details of listings saved by a specific user.
 * @param {string} userId - The ID of the user (explorer).
 * @returns {Promise<Array<object>>} - A promise resolving to an array of saved listing details.
 */
export async function getSavedItemsDetails(userId) {
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
    const user = await User.findById(userObjectId).select("savedItems").lean();

    if (!user || !user.savedItems || user.savedItems.length === 0) {
      return [];
    }

    // Fetch the listings based on the saved item IDs
    const savedListings = await Listing.find({
      _id: { $in: user.savedItems },
      status: "approved", // Optionally ensure they are still approved
      isActive: true, // Optionally ensure they are still active
    })
      .populate("advertiserId", "name username") // Populate advertiser info
      .lean();

    // Sanitize data for client
    return savedListings.map((listing) => ({
      ...listing,
      _id: listing._id.toString(),
      id: listing._id.toString(),
      advertiserId: listing.advertiserId?._id
        ? {
            _id: listing.advertiserId._id.toString(),
            name: listing.advertiserId.name,
            username: listing.advertiserId.username,
          }
        : null,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      expiresAt: listing.expiresAt ? listing.expiresAt.toISOString() : null,
      eventDate: listing.eventDate ? listing.eventDate.toISOString() : null,
    }));
  } catch (error) {
    console.error(`Error fetching saved items for user ${userId}:`, error);
    return [];
  }
}

/**
 * Removes a listing from a user's saved items.
 * @param {string} userId - The ID of the user (explorer).
 * @param {string} listingId - The ID of the listing to remove.
 * @returns {Promise<object>} - Result object { success: boolean, message: string }
 */
export async function unsaveItem(userId, listingId) {
  try {
    if (!userId || !listingId) {
      return { success: false, message: "Invalid user or listing ID" };
    }

    await connectToDb();

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check if the item is already saved
    const isItemSaved = user.savedItems.includes(listingId);
    if (!isItemSaved) {
      return { success: false, message: "Item is not in your saved items" };
    }

    // Remove the item from saved items
    await User.findByIdAndUpdate(
      userId,
      { $pull: { savedItems: listingId } },
      { new: true }
    );

    revalidatePath("/saved-items");
    revalidatePath("/search");

    return { success: true, message: "Item removed from saved items" };
  } catch (error) {
    console.error("Error unsaving item:", error);
    return {
      success: false,
      message: "Failed to remove item from saved items",
    };
  }
}

/**
 * Saves a listing to a user's saved items.
 * @param {string} userId - The ID of the user (explorer).
 * @param {string} listingId - The ID of the listing to save.
 * @returns {Promise<object>} - Result object { success: boolean, message: string }
 */
export async function saveItem(userId, listingId) {
  if (!userId || !listingId) {
    return { success: false, message: "User ID and Listing ID are required." };
  }

  let userObjectId, listingObjectId;
  try {
    userObjectId = new mongoose.Types.ObjectId(userId);
    listingObjectId = new mongoose.Types.ObjectId(listingId);
  } catch (err) {
    console.error("Invalid ID for ObjectId conversion:", err);
    return { success: false, message: "Invalid User or Listing ID." };
  }

  try {
    await connectToDb();

    // Check if item is already saved
    const user = await User.findById(userObjectId).select("savedItems");
    if (user.savedItems.includes(listingObjectId)) {
      return { success: false, message: "Item is already saved." };
    }

    // Add item to saved items
    const result = await User.findByIdAndUpdate(
      userObjectId,
      { $addToSet: { savedItems: listingObjectId } }, // Use $addToSet to prevent duplicates
      { new: true }
    );

    if (!result) {
      return { success: false, message: "User not found." };
    }

    console.log(`Listing ${listingId} saved for user ${userId}`);
    // Revalidate paths to reflect changes
    revalidatePath("/saved-items");
    revalidatePath("/dashboard");

    return { success: true, message: "Item saved successfully." };
  } catch (error) {
    console.error(`Error saving item ${listingId} for user ${userId}:`, error);
    return {
      success: false,
      message: "Failed to save item.",
    };
  }
}
