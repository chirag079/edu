"use server";

import { connectToDb } from "../lib/db";
import { Message } from "../lib/models/message.schema.js"; // Import the Message model
import mongoose from "mongoose";

// STUB Implementation - Replace with actual DB/Chat service logic
export async function getUnreadMessagesCount(userId) {
  if (!userId) return 0;

  // Convert userId string to ObjectId if it's not already
  let userObjectId;
  try {
    userObjectId = new mongoose.Types.ObjectId(userId);
  } catch (err) {
    return 0;
  }

  try {
    await connectToDb();
    // Count messages where the user is the receiver and isRead is false
    const count = await Message.countDocuments({
      receiverId: userObjectId,
      isRead: false,
    });
    return count;
  } catch (error) {
    console.error(
      `Error fetching unread message count for user ${userId}:`,
      error
    );
    return 0; // Return 0 on error
  }
}
