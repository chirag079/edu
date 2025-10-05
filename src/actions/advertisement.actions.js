"use server";

import { connectToDb } from "@/lib/db";
import { Approval } from "@/lib/models/approval.schema";
import mongoose from "mongoose";
import { deductFundsFromWallet } from "./wallet.actions";

/**
 * Creates an advertisement request and corresponding approval request
 */
export async function createAdvertisementRequest(
  data,
  itemType,
  userId,
  college
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToDb();

    // Import the correct model based on item type
    let Model;
    switch (itemType) {
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

    // Calculate cost based on item type and duration
    const calculatedCost = calculateAdvertisementCost(itemType, data.duration);

    // Deduct funds from wallet
    const deductResult = await deductFundsFromWallet(
      userId,
      calculatedCost,
      session
    );
    if (!deductResult.success) {
      throw new Error(deductResult.message || "Failed to deduct funds");
    }

    // Create the item in its respective schema
    const item = await Model.create(
      [
        {
          ...data,
          status: "pending",
          createdBy: userId,
          college,
          calculatedCost,
        },
      ],
      { session }
    );

    // Create approval request
    await Approval.create(
      [
        {
          onModel: itemType,
          itemId: item[0]._id,
          itemType,
          advertiser: userId,
          college,
          calculatedCost,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return {
      success: true,
      message: "Advertisement request created successfully",
    };
  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating advertisement request:", error);
    return {
      success: false,
      message: error.message || "Failed to create advertisement request",
    };
  } finally {
    session.endSession();
  }
}

/**
 * Calculates advertisement cost based on type and duration
 */
function calculateAdvertisementCost(itemType, duration) {
  const baseCosts = {
    Stationary: 50,
    Flat: 100,
    Event: 75,
    Restaurant: 150,
  };

  const baseAmount = baseCosts[itemType] || 50;
  return baseAmount * (duration || 1); // Cost per day/week/month based on duration
}

/**
 * Fetches approved advertisements by college and type
 */
export async function fetchApprovedAdvertisements(
  college,
  itemType,
  limit = 10
) {
  try {
    await connectToDb();

    // Import the correct model
    let Model;
    switch (itemType) {
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

    const items = await Model.find({
      college,
      status: "approved",
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("createdBy", "username name");

    return items;
  } catch (error) {
    console.error(`Error fetching ${itemType} advertisements:`, error);
    return [];
  }
}
