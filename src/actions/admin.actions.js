"use server";
import { connectToDb } from "@/lib/db";
import { Approval } from "@/lib/models/approval.schema";
import { User } from "@/lib/models/user.schema";
import { updateItem } from "./items.actions";
import { revalidatePath } from "next/cache";
import { Listing } from "@/lib/models/listing.schema.js";
import mongoose from "mongoose";
import { addFundsToWallet } from "./wallet.actions"; // Import wallet action

export async function fetchAdmins() {
  try {
    await connectToDb();
    const admins = await User.find({ role: "Admin" }).sort({ username: 1 });
    return admins;
    // console.log(admins);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function deleteAdmin(username) {
  try {
    await connectToDb();
    const del = await User.deleteOne({ username: username });
    return;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function fetchUserByUserName(username) {
  try {
    await connectToDb();
    const users = await User.find({
      username: { $regex: username, $options: "i" },
    });
    // console.log(users);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function fetchAdminDetails(id) {
  try {
    await connectToDb();
    const data = await User.findById(id).select({
      _id: 1,
      email: 1,
      username: 1,
    });

    return data;
  } catch (error) {
    console.log(error);
    return;
  }
}
export async function promoteAdmin(username) {
  try {
    await connectToDb();
    const del = await User.findOneAndUpdate(
      { username: username },
      { role: "Admin" }
    );
    return;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function fetchPendingProductApprovals(page) {
  try {
    await connectToDb();
    const approvals = await Approval.find({ approvalStatus: "Pending" })
      .skip(page * 7)
      .limit(7)
      .populate("Model", { name: 1 })
      .populate("lender", { username: 1 });
    return approvals;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function processApprovalRequest(id, type, action) {
  try {
    await connectToDb();
    const status = action === "Approve" ? "Approved" : "Declined";
    const data = await Approval.findByIdAndUpdate(id, {
      approvalStatus: status,
    });
    await updateItem(data?.onModel, data?.Model, { approvalStatus: status });
  } catch (error) {
    console.log(error);
    return;
  }
  revalidatePath("/admin/update");
}
export async function checkIfAlreadyProcessed(id) {
  try {
    await connectToDb();
    const approval = await Approval.findById(id);

    if (approval?.approvalStatus !== "Pending") {
      return true;
    }

    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// Action to fetch the count of pending listings
export async function getPendingListingsCount() {
  try {
    await connectToDb();
    const count = await Listing.countDocuments({ status: "pending" });
    return count;
  } catch (error) {
    console.error("Error fetching pending listings count:", error);
    return 0;
  }
}

// Action to fetch the total number of users
export async function getUserCount() {
  try {
    await connectToDb();
    const count = await User.countDocuments(); // Count all users
    return count;
  } catch (error) {
    console.error("Error fetching user count:", error);
    return 0;
  }
}

// Action to fetch the count of pending Events
export async function getPendingEventsCount() {
  try {
    await connectToDb();
    const { Event } = await import("@/lib/models/event.schema.js");
    const count = await Event.countDocuments({ status: "pending" });
    return count;
  } catch (error) {
    console.error("Error fetching pending events count:", error);
    return 0;
  }
}

// Action to fetch the count of pending Restaurants
export async function getPendingRestaurantsCount() {
  try {
    await connectToDb();
    const { Restaurant } = await import("@/lib/models/restaurant.schema.js");
    const count = await Restaurant.countDocuments({ status: "pending" });
    return count;
  } catch (error) {
    console.error("Error fetching pending restaurants count:", error);
    return 0;
  }
}

// Action to fetch pending listings for display
// Add pagination later if needed
export async function getPendingListings(limit = 10, page = 1) {
  try {
    await connectToDb();
    const skip = (page - 1) * limit;
    const listings = await Listing.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("advertiserId", "username name email") // Populate advertiser details
      .lean();

    // Sanitize ObjectIds
    return listings.map((listing) => ({
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
    }));
  } catch (error) {
    console.error("Error fetching pending listings:", error);
    return [];
  }
}

// Action to approve a listing
export async function approveListing(listingId) {
  if (!listingId) throw new Error("Listing ID is required.");
  try {
    await connectToDb();
    const updatedListing = await Listing.findByIdAndUpdate(
      listingId,
      { status: "approved", isActive: true },
      { new: true }
    );
    if (!updatedListing) throw new Error("Listing not found.");
    console.log(`Listing ${listingId} approved.`);
    revalidatePath("/admin/approve-listings");
    revalidatePath("/dashboard");
    revalidatePath("/search");
    return { success: true, message: "Listing approved." };
  } catch (error) {
    console.error(`Error approving listing ${listingId}:`, error);
    return { success: false, message: "Failed to approve listing." };
  }
}

// Action to reject a listing
export async function rejectListing(listingId) {
  if (!listingId) throw new Error("Listing ID is required.");

  const session = await mongoose.startSession(); // Use transaction
  session.startTransaction();

  try {
    await connectToDb();
    const listing = await Listing.findById(listingId).session(session);

    if (!listing) {
      throw new Error("Listing not found.");
    }
    if (listing.status !== "pending") {
      // Avoid double-refunding or rejecting approved items via this flow
      throw new Error("Listing is not in pending state.");
    }

    // Update listing status to rejected
    listing.status = "rejected";
    // Optionally set isActive to false if rejected listings shouldn't be seen anywhere
    // listing.isActive = false;
    await listing.save({ session });

    // Refund the advertiser
    const costToRefund = listing.calculatedCost;
    if (typeof costToRefund === "number" && costToRefund > 0) {
      // We need the advertiser's ID
      const advertiserId = listing.advertiserId;
      if (!advertiserId) {
        throw new Error("Advertiser ID missing on listing for refund.");
      }

      // Add funds back using a specific transaction type/description
      await User.findByIdAndUpdate(
        advertiserId,
        {
          $inc: { "wallet.balance": costToRefund },
          $push: {
            "wallet.transactions": {
              type: "refund", // Use refund type
              amount: costToRefund, // Positive amount for refund
              description: `Refund for rejected listing: ${listing.title}`,
            },
          },
        },
        { session: session } // Ensure this operation is part of the transaction
      );
      console.log(
        `Refunded ${costToRefund} to user ${advertiserId} for rejected listing ${listingId}.`
      );
    } else {
      console.log(
        `No calculated cost found for listing ${listingId}, no refund issued.`
      );
    }

    await session.commitTransaction(); // Commit transaction
    console.log(
      `Listing ${listingId} rejected and refund processed (if applicable).`
    );
    // Revalidate relevant paths/tags
    // revalidatePath('/admin/update');
    return {
      success: true,
      message: "Listing rejected and refunded (if applicable).",
    };
  } catch (error) {
    await session.abortTransaction(); // Rollback on error
    console.error(`Error rejecting listing ${listingId}:`, error);
    return {
      success: false,
      message: error.message || "Failed to reject listing.",
    };
  } finally {
    session.endSession();
  }
}

// Action to fetch all users for management (add pagination later)
export async function getAllUsers(limit = 10, page = 1) {
  try {
    await connectToDb();
    const skip = (page - 1) * limit;
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password") // Exclude passwords
      .lean();

    // Sanitize ObjectIds
    return users.map((user) => ({
      ...user,
      _id: user._id.toString(),
      id: user._id.toString(),
      // Sanitize nested objects if needed
      wallet: user.wallet ? { balance: user.wallet.balance } : { balance: 0 },
    }));
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

// Action to update a user's role
export async function updateUserRole(userId, newRole) {
  if (!userId || !newRole)
    throw new Error("User ID and new role are required.");
  if (!["admin", "advertiser", "explorer"].includes(newRole)) {
    throw new Error("Invalid role specified.");
  }
  try {
    await connectToDb();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    );
    if (!updatedUser) throw new Error("User not found.");
    console.log(`User ${userId} role updated to ${newRole}.`);
    // Revalidate relevant paths/tags
    return { success: true, message: "User role updated." };
  } catch (error) {
    console.error(`Error updating role for user ${userId}:`, error);
    return { success: false, message: "Failed to update user role." };
  }
}

// Action to delete a user (use with caution!)
export async function deleteUser(userId) {
  if (!userId) throw new Error("User ID is required.");
  try {
    await connectToDb();
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) throw new Error("User not found.");
    console.log(`User ${userId} deleted.`);
    // Also consider deleting associated listings, messages, etc. (cascade delete)
    // Revalidate relevant paths/tags
    return { success: true, message: "User deleted." };
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    return { success: false, message: "Failed to delete user." };
  }
}

/**
 * Fetches pending Events.
 * @param {number} limit - Max number of events to return.
 * @returns {Promise<Array<object>>} - Array of pending event objects.
 */
export async function getPendingEvents(limit = 20) {
  try {
    await connectToDb();
    const { Event } = await import("@/lib/models/event.schema.js");
    const events = await Event.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("createdBy", "username") // Populate creator username
      .lean();

    // Sanitize for client component
    return events.map((event) => ({
      ...event,
      id: event._id.toString(), // Use id for consistency
      _id: event._id.toString(),
      createdBy: event.createdBy?._id
        ? {
            _id: event.createdBy._id.toString(),
            username: event.createdBy.username,
          }
        : null,
      startDate: event.startDate?.toISOString(), // Stringify dates
      endDate: event.endDate?.toISOString(),
      createdAt: event.createdAt?.toISOString(),
      updatedAt: event.updatedAt?.toISOString(),
      itemType: "Event", // Add itemType identifier
    }));
  } catch (error) {
    console.error("Error fetching pending events:", error);
    return [];
  }
}

/**
 * Fetches pending Restaurants.
 * @param {number} limit - Max number of restaurants to return.
 * @returns {Promise<Array<object>>} - Array of pending restaurant objects.
 */
export async function getPendingRestaurants(limit = 20) {
  try {
    await connectToDb();
    const { Restaurant } = await import("@/lib/models/restaurant.schema.js");
    const restaurants = await Restaurant.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("createdBy", "username") // Populate creator username
      .lean();

    // Sanitize for client component
    return restaurants.map((restaurant) => ({
      ...restaurant,
      id: restaurant._id.toString(), // Use id for consistency
      _id: restaurant._id.toString(),
      name: restaurant.name, // Use name field
      createdBy: restaurant.createdBy?._id
        ? {
            _id: restaurant.createdBy._id.toString(),
            username: restaurant.createdBy.username,
          }
        : null,
      createdAt: restaurant.createdAt?.toISOString(),
      updatedAt: restaurant.updatedAt?.toISOString(),
      itemType: "Restaurant", // Add itemType identifier
    }));
  } catch (error) {
    console.error("Error fetching pending restaurants:", error);
    return [];
  }
}

// --- Approve/Reject Actions for Events ---
export async function approveEvent(eventId) {
  if (!eventId) throw new Error("Event ID is required.");
  try {
    await connectToDb();
    const { Event } = await import("@/lib/models/event.schema.js");
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { status: "approved" },
      { new: true }
    );
    if (!updatedEvent) throw new Error("Event not found.");
    console.log(`Event ${eventId} approved.`);
    revalidatePath("/admin/update"); // Revalidate admin page
    return { success: true, message: "Event approved." };
  } catch (error) {
    console.error(`Error approving event ${eventId}:`, error);
    return { success: false, message: "Failed to approve event." };
  }
}

export async function rejectEvent(eventId) {
  if (!eventId) throw new Error("Event ID is required.");
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await connectToDb();
    const { Event } = await import("@/lib/models/event.schema.js");
    const event = await Event.findById(eventId).session(session);

    if (!event) throw new Error("Event not found.");
    if (event.status !== "pending") throw new Error("Event is not pending.");

    event.status = "rejected";
    await event.save({ session });

    const costToRefund = event.calculatedCost;
    if (typeof costToRefund === "number" && costToRefund > 0) {
      const creatorId = event.createdBy;
      if (!creatorId) throw new Error("Creator ID missing for refund.");
      await User.findByIdAndUpdate(
        creatorId,
        {
          $inc: { "wallet.balance": costToRefund },
          $push: {
            "wallet.transactions": {
              type: "refund",
              amount: costToRefund,
              description: `Refund for rejected event: ${event.title}`,
            },
          },
        },
        { session: session }
      );
      console.log(`Refunded ${costToRefund} for rejected event ${eventId}.`);
    }

    await session.commitTransaction();
    revalidatePath("/admin/update");
    return {
      success: true,
      message: "Event rejected and refunded (if applicable).",
    };
  } catch (error) {
    await session.abortTransaction();
    console.error(`Error rejecting event ${eventId}:`, error);
    return {
      success: false,
      message: error.message || "Failed to reject event.",
    };
  } finally {
    session.endSession();
  }
}

// --- Approve/Reject Actions for Restaurants ---
export async function approveRestaurant(restaurantId) {
  if (!restaurantId) throw new Error("Restaurant ID is required.");
  try {
    await connectToDb();
    const { Restaurant } = await import("@/lib/models/restaurant.schema.js");
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { status: "approved" },
      { new: true }
    );
    if (!updatedRestaurant) throw new Error("Restaurant not found.");
    console.log(`Restaurant ${restaurantId} approved.`);
    revalidatePath("/admin/update");
    return { success: true, message: "Restaurant approved." };
  } catch (error) {
    console.error(`Error approving restaurant ${restaurantId}:`, error);
    return { success: false, message: "Failed to approve restaurant." };
  }
}

export async function rejectRestaurant(restaurantId) {
  if (!restaurantId) throw new Error("Restaurant ID is required.");
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await connectToDb();
    const { Restaurant } = await import("@/lib/models/restaurant.schema.js");
    const restaurant = await Restaurant.findById(restaurantId).session(session);

    if (!restaurant) throw new Error("Restaurant not found.");
    if (restaurant.status !== "pending")
      throw new Error("Restaurant is not pending.");

    restaurant.status = "rejected";
    await restaurant.save({ session });

    const costToRefund = restaurant.calculatedCost;
    if (typeof costToRefund === "number" && costToRefund > 0) {
      const creatorId = restaurant.createdBy;
      if (!creatorId) throw new Error("Creator ID missing for refund.");
      await User.findByIdAndUpdate(
        creatorId,
        {
          $inc: { "wallet.balance": costToRefund },
          $push: {
            "wallet.transactions": {
              type: "refund",
              amount: costToRefund,
              description: `Refund for rejected restaurant: ${restaurant.name}`,
            },
          },
        },
        { session: session }
      );
      console.log(
        `Refunded ${costToRefund} for rejected restaurant ${restaurantId}.`
      );
    }

    await session.commitTransaction();
    revalidatePath("/admin/update");
    return {
      success: true,
      message: "Restaurant rejected and refunded (if applicable).",
    };
  } catch (error) {
    await session.abortTransaction();
    console.error(`Error rejecting restaurant ${restaurantId}:`, error);
    return {
      success: false,
      message: error.message || "Failed to reject restaurant.",
    };
  } finally {
    session.endSession();
  }
}

/**
 * Fetches all pending approval requests
 */
export async function getPendingApprovals(limit = 20) {
  try {
    await connectToDb();
    const approvals = await Approval.find({ approvalStatus: "pending" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("advertiser", "username name")
      .lean();

    // Fetch the actual items
    const populatedApprovals = await Promise.all(
      approvals.map(async (approval) => {
        let Model;
        switch (approval.itemType) {
          case "Stationary":
            Model = (await import("@/lib/models/stationary.schema.js"))
              .Stationary;
            break;
          case "Flat":
            Model = (await import("@/lib/models/flat.schema.js")).Flat;
            break;
          case "Event":
            Model = (await import("@/lib/models/event.schema.js")).Event;
            break;
          case "Restaurant":
            Model = (await import("@/lib/models/restaurant.schema.js"))
              .Restaurant;
            break;
        }

        const item = await Model.findById(approval.itemId).lean();
        return {
          ...approval,
          item,
          _id: approval._id.toString(),
          advertiser: {
            ...approval.advertiser,
            _id: approval.advertiser._id.toString(),
          },
        };
      })
    );

    return populatedApprovals;
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    return [];
  }
}

/**
 * Approves an advertisement request
 */
export async function approveAdvertisement(approvalId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToDb();

    // Find the approval request
    const approval = await Approval.findById(approvalId).session(session);
    if (!approval) throw new Error("Approval request not found");
    if (approval.approvalStatus !== "pending")
      throw new Error("Request is not pending");

    // Get the correct model
    let Model;
    switch (approval.itemType) {
      case "Stationary":
        Model = (await import("@/lib/models/stationary.schema.js")).Stationary;
        break;
      case "Flat":
        Model = (await import("@/lib/models/flat.schema.js")).Flat;
        break;
      case "Event":
        Model = (await import("@/lib/models/event.schema.js")).Event;
        break;
      case "Restaurant":
        Model = (await import("@/lib/models/restaurant.schema.js")).Restaurant;
        break;
      default:
        throw new Error("Invalid item type");
    }

    // Update the item status
    const item = await Model.findByIdAndUpdate(
      approval.itemId,
      {
        status: "approved",
        isActive: true,
      },
      { session, new: true }
    );
    if (!item) throw new Error("Item not found");

    // Delete the approval request
    await Approval.findByIdAndDelete(approvalId).session(session);

    await session.commitTransaction();
    revalidatePath("/admin/approve-listings");
    revalidatePath("/dashboard");
    revalidatePath("/search");
    return { success: true, message: "Advertisement approved successfully" };
  } catch (error) {
    await session.abortTransaction();
    console.error("Error approving advertisement:", error);
    return {
      success: false,
      message: error.message || "Failed to approve advertisement",
    };
  } finally {
    session.endSession();
  }
}

/**
 * Rejects an advertisement request
 */
export async function rejectAdvertisement(approvalId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToDb();

    // Find the approval request
    const approval = await Approval.findById(approvalId).session(session);
    if (!approval) throw new Error("Approval request not found");
    if (approval.approvalStatus !== "pending")
      throw new Error("Request is not pending");

    // Get the correct model
    let Model;
    switch (approval.itemType) {
      case "Stationary":
        Model = (await import("@/lib/models/stationary.schema.js")).Stationary;
        break;
      case "Flat":
        Model = (await import("@/lib/models/flat.schema.js")).Flat;
        break;
      case "Event":
        Model = (await import("@/lib/models/event.schema.js")).Event;
        break;
      case "Restaurant":
        Model = (await import("@/lib/models/restaurant.schema.js")).Restaurant;
        break;
      default:
        throw new Error("Invalid item type");
    }

    // Update the item status
    const item = await Model.findByIdAndUpdate(
      approval.itemId,
      { status: "rejected" },
      { session }
    );
    if (!item) throw new Error("Item not found");

    // Process refund
    if (approval.calculatedCost > 0) {
      await User.findByIdAndUpdate(
        approval.advertiser,
        {
          $inc: { "wallet.balance": approval.calculatedCost },
          $push: {
            "wallet.transactions": {
              type: "refund",
              amount: approval.calculatedCost,
              description: `Refund for rejected ${approval.itemType.toLowerCase()}`,
            },
          },
        },
        { session }
      );
    }

    // Delete the approval request
    await Approval.findByIdAndDelete(approvalId).session(session);

    await session.commitTransaction();
    revalidatePath("/admin/approve-listings");
    return { success: true, message: "Advertisement rejected and refunded" };
  } catch (error) {
    await session.abortTransaction();
    console.error("Error rejecting advertisement:", error);
    return {
      success: false,
      message: error.message || "Failed to reject advertisement",
    };
  } finally {
    session.endSession();
  }
}
