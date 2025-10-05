"use server";

import { connectToDb } from "@/lib/db";
import { User } from "@/lib/models/user.schema";
import mongoose from "mongoose";

export async function getUserWalletBalance(userId) {
  if (!userId) return 0;
  try {
    await connectToDb();
    // Select only the wallet balance for efficiency
    const user = await User.findById(userId).select("wallet.balance").lean();
    return user?.wallet?.balance ?? 0; // Return balance or 0 if not found
  } catch (error) {
    console.error(`Error fetching wallet balance for user ${userId}:`, error);
    return 0; // Return 0 on error
  }
}

export async function addFundsToWallet(userId, amountToAdd) {
  if (!userId || typeof amountToAdd !== "number" || amountToAdd <= 0) {
    throw new Error("Invalid input for adding funds.");
  }
  try {
    await connectToDb();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { "wallet.balance": amountToAdd }, // Increment balance
        $push: {
          // Add transaction record
          "wallet.transactions": {
            type: "recharge",
            amount: amountToAdd,
            description: "Funds added to wallet",
          },
        },
      },
      { new: true, select: "wallet.balance" } // Return the updated balance
    ).lean();

    if (!updatedUser) {
      throw new Error("User not found.");
    }
    return { success: true, newBalance: updatedUser.wallet.balance };
  } catch (error) {
    console.error(`Error adding funds for user ${userId}:`, error);
    throw new Error("Failed to add funds."); // Re-throw or return error object
  }
}

export async function deductFundsForListing(userId, cost, listingTitle) {
  if (!userId || typeof cost !== "number" || cost <= 0) {
    throw new Error("Invalid input for deducting funds.");
  }

  const session = await mongoose.startSession(); // Use transaction for safety
  session.startTransaction();

  try {
    await connectToDb(); // Ensure connection within transaction

    // Find user within the session
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error("User not found.");
    }
    if ((user.wallet?.balance ?? 0) < cost) {
      return {
        success: false,
        message: "Insufficient balance.",
        currentBalance: user.wallet?.balance ?? 0,
      };
    }

    // Deduct funds and add transaction
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { "wallet.balance": -cost },
        $push: {
          "wallet.transactions": {
            type: "advertisement",
            amount: -cost, // Negative amount for deduction
            description: `Fee for listing: ${listingTitle || "Item"}`,
          },
        },
      },
      { new: true, session: session, select: "wallet.balance" } // Use session
    ).lean();

    await session.commitTransaction(); // Commit if successful

    return { success: true, newBalance: updatedUser.wallet.balance };
  } catch (error) {
    await session.abortTransaction(); // Rollback on error
    console.error(`Error deducting funds for user ${userId}:`, error);
    // Don't expose internal errors directly
    if (
      error.message === "Insufficient balance." ||
      error.message === "User not found."
    ) {
      throw error;
    }
    throw new Error("Failed to process transaction.");
  } finally {
    session.endSession(); // Always end the session
  }
}
