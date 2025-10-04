"use server";

import { connectToDb } from "../lib/db";
import { Message, Conversation } from "../lib/models/message.schema";
import { Listing } from "../lib/models/listing.schema";
import { User } from "../lib/models/user.schema";
import { auth } from "../auth";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

/**
 * Send a message and update/create the corresponding conversation.
 */
export async function sendMessage(receiverId, listingId, content) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "Authentication required" };
    }
    const senderId = session.user.id;

    if (!receiverId || !listingId || !content || !content.trim()) {
      return { success: false, message: "Missing required fields." };
    }

    // Ensure sender and receiver are different
    if (senderId === receiverId) {
      return { success: false, message: "Cannot send message to yourself." };
    }

    await connectToDb();

    // Validate Listing exists (optional but good practice)
    const listingExists = await Listing.findById(listingId);
    if (!listingExists) {
      return { success: false, message: "Listing not found." };
    }

    // Create the message
    const newMessage = new Message({
      senderId,
      receiverId,
      listingId,
      content: content.trim(),
    });

    // Sort participants to maintain consistent ordering
    const participants = [senderId, receiverId].sort();

    // First, check if a conversation already exists between these participants for this listing
    let conversation = await Conversation.findOne({
      participants: participants,
      listing: listingId,
    });

    if (conversation) {
      // Conversation exists - just update the lastMessage
      conversation.lastMessage = newMessage._id;
      await conversation.save();
    } else {
      // Create a new conversation
      conversation = new Conversation({
        participants: participants,
        listing: listingId,
        lastMessage: newMessage._id,
        isArchived: false,
        archivedBy: [],
      });
      await conversation.save();
    }

    // Now save the message
    await newMessage.save();

    // Revalidate the messages page to reflect changes
    revalidatePath("/messages");
    return {
      success: true,
      message: "Message sent successfully",
      conversationId: conversation._id.toString(),
    };
  } catch (error) {
    console.error("Error sending message:", error);
    // Provide more specific error info if possible
    let errMsg = "Failed to send message";
    if (error instanceof mongoose.Error.ValidationError) {
      errMsg = "Validation error: " + error.message;
    } else if (error.code === 11000) {
      // Duplicate key error
      errMsg = "Duplicate entry error."; // Adjust as needed
    }
    return { success: false, message: errMsg };
  }
}

/**
 * Get all conversations for the current user.
 */
export async function getUserConversations() {
  try {
    const session = await auth();
    if (!session?.user) {
      console.log("No session found for getUserConversations");
      return [];
    }
    const userId = session.user.id;

    await connectToDb();

    const conversations = await Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 }) // Sort by most recently updated conversation
      .populate({
        path: "participants",
        match: { _id: { $ne: userId } }, // Exclude current user from populated participants
        select: "name username image", // Select fields for the other participant
        model: User, // Explicitly specify model
      })
      .populate({
        path: "listing",
        select: "title itemType images", // Select fields for the listing
        model: Listing, // Explicitly specify model
      })
      .populate({
        path: "lastMessage",
        select: "content createdAt senderId isRead receiverId", // Select fields for the last message
        model: Message, // Explicitly specify model
        populate: {
          // Populate sender of last message to check read status correctly
          path: "senderId",
          select: "name",
          model: User,
        },
      })
      .lean(); // Use lean for performance and plain JS objects

    if (!conversations) {
      console.log("No conversations found for user:", userId);
      return [];
    }

    // Process conversations to simplify structure and convert IDs
    const processedConversations = conversations.map((conv) => {
      // Since we matched $ne: userId, participants array should contain only the other user(s)
      const otherParticipant =
        conv.participants && conv.participants.length > 0
          ? conv.participants[0]
          : null;

      // Determine if the last message is unread FOR THE CURRENT USER
      let isUnread = false;
      if (
        conv.lastMessage &&
        conv.lastMessage.receiverId?.toString() === userId &&
        !conv.lastMessage.isRead
      ) {
        isUnread = true;
      }

      return {
        _id: conv._id.toString(),
        otherParticipant: otherParticipant
          ? {
              _id: otherParticipant._id.toString(),
              name: otherParticipant.name,
              username: otherParticipant.username,
              image: otherParticipant.image,
            }
          : null,
        listing: conv.listing
          ? {
              _id: conv.listing._id.toString(),
              title: conv.listing.title,
              itemType: conv.listing.itemType,
              // Send only the first image URL if available
              image:
                conv.listing.images && conv.listing.images.length > 0
                  ? conv.listing.images[0]
                  : null,
            }
          : null,
        lastMessage: conv.lastMessage
          ? {
              _id: conv.lastMessage._id.toString(),
              content: conv.lastMessage.content,
              createdAt: conv.lastMessage.createdAt?.toISOString(), // Convert Date to ISO string
              isSender: conv.lastMessage.senderId?._id.toString() === userId,
              senderName: conv.lastMessage.senderId?.name, // Add sender name for context like "You: ..."
            }
          : null,
        isUnread: isUnread, // Add the calculated unread status
        updatedAt: conv.updatedAt?.toISOString(), // Convert Date to ISO string
      };
    });

    // console.log("Processed Conversations:", JSON.stringify(processedConversations, null, 2));
    return processedConversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    // Return empty array or throw an error depending on desired handling
    return [];
  }
}

/**
 * Get unread message count for the current user (Total across all conversations)
 */
export async function getUnreadMessagesCount(userId) {
  if (!userId) return 0;

  try {
    await connectToDb();
    return await Message.countDocuments({
      receiverId: userId,
      isRead: false,
    });
  } catch (error) {
    console.error("Error counting unread messages:", error);
    return 0;
  }
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(messageId) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "Authentication required" };
    }

    await connectToDb();

    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        receiverId: session.user.id,
        isRead: false, // Only update if it's not already read
      },
      { isRead: true },
      { new: true } // Return the updated document (or null if no update occurred)
    );

    if (!message) {
      // It might be already read or doesn't belong to the user
      // console.log("Message not found or already marked as read:", messageId);
      return {
        success: true,
        message: "Message already marked as read or not found",
      };
    }

    // Revalidate potentially the conversations list AND the specific conversation view
    revalidatePath("/messages");
    // const conversation = await Conversation.findOne({ participants: session.user.id, lastMessage: messageId });
    // if (conversation) {
    //   revalidatePath(`/messages/${conversation._id}`);
    // }

    return { success: true, message: "Message marked as read" };
  } catch (error) {
    console.error("Error marking message as read:", error);
    return { success: false, message: "Failed to mark message as read" };
  }
}

/**
 * Get conversation between two users for a specific listing
 */
export async function getListingConversation(listingId, otherUserId) {
  try {
    const session = await auth();
    if (!session?.user) {
      return [];
    }

    await connectToDb();

    const messages = await Message.find({
      listingId,
      $or: [
        { senderId: session.user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: session.user.id },
      ],
    })
      .sort({ createdAt: 1 }) // Chronological order for chat display
      .populate("senderId", "name username image") // Include image
      // Don't need receiverId populated as we know who the two participants are
      .lean();

    // Process messages to convert IDs
    return messages.map((message) => ({
      ...message,
      _id: message._id.toString(),
      listingId: message.listingId.toString(),
      senderId: message.senderId
        ? {
            _id: message.senderId._id.toString(),
            name: message.senderId.name,
            username: message.senderId.username,
            image: message.senderId.image,
          }
        : null,
      // receiverId is not needed in the mapped output for the chat view
    }));
  } catch (error) {
    console.error("Error fetching listing conversation:", error);
    return [];
  }
}

/**
 * Get details for a single conversation.
 */
export async function getConversationDetails(conversationId) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Authentication required");
    const userId = session.user.id;

    await connectToDb();

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      console.log("Invalid conversation ID format:", conversationId);
      return null; // Or throw an error
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId, // Ensure the current user is part of this conversation
    })
      .populate({
        path: "participants",
        select: "name username image", // Populate all participants initially
        model: User,
      })
      .populate({
        path: "listing",
        select: "title itemType images advertiserId", // Changed from createdBy to advertiserId
        model: Listing,
        populate: {
          // Populate listing owner
          path: "advertiserId", // Changed from createdBy to advertiserId
          select: "name",
          model: User,
        },
      })
      .lean();

    if (!conversation) {
      console.log(
        "Conversation not found or user not a participant:",
        conversationId,
        userId
      );
      return null;
    }

    // Simplify participants: exclude current user
    const otherParticipants = conversation.participants.filter(
      (p) => p._id.toString() !== userId
    );
    // Assuming mostly 1-on-1 chats for now
    const otherParticipant =
      otherParticipants.length > 0 ? otherParticipants[0] : null;

    return {
      _id: conversation._id.toString(),
      // Return all participants for potential group chat extension
      // participants: conversation.participants.map(p => ({ ...p, _id: p._id.toString()})),
      otherParticipant: otherParticipant
        ? { ...otherParticipant, _id: otherParticipant._id.toString() }
        : null,
      listing: conversation.listing
        ? {
            ...conversation.listing,
            _id: conversation.listing._id.toString(),
            createdBy: conversation.listing.advertiserId // Changed from createdBy to advertiserId
              ? {
                  // Ensure advertiserId is populated
                  _id: conversation.listing.advertiserId._id.toString(),
                  name: conversation.listing.advertiserId.name,
                }
              : null,
            // Keep image processing simple for now
            image:
              conversation.listing.images &&
              conversation.listing.images.length > 0
                ? conversation.listing.images[0]
                : null,
          }
        : null,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    // In a real app, might want to differentiate errors (not found vs server error)
    return null;
  }
}

/**
 * Get all messages for a specific conversation.
 */
export async function getMessagesForConversation(conversationId) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Authentication required");
    const userId = session.user.id;

    await connectToDb();

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return [];
    }

    // First, get the conversation to verify access and get listingId/participants
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    }).lean();

    if (!conversation) {
      return []; // User is not part of this conversation or it doesn't exist
    }

    // Fetch messages based on listing and participants from the conversation document
    const messages = await Message.find({
      listingId: conversation.listing, // Use the listingId from the conversation
      // Ensure messages are between the participants of this specific conversation
      $or: [
        {
          senderId: conversation.participants[0],
          receiverId: conversation.participants[1],
        },
        {
          senderId: conversation.participants[1],
          receiverId: conversation.participants[0],
        },
      ],
      // This assumes 2 participants. For group chats, the query would need adjustment
    })
      .sort({ createdAt: 1 }) // Chronological order
      .populate("senderId", "name username image")
      .lean();

    // Process messages
    return messages.map((message) => ({
      // Only include serializable fields explicitly
      _id: message._id.toString(),
      listingId: message.listingId.toString(),
      senderId: message.senderId
        ? {
            _id: message.senderId._id.toString(),
            name: message.senderId.name,
            username: message.senderId.username,
            image: message.senderId.image,
          }
        : null,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt?.toISOString(), // Convert Date
      updatedAt: message.updatedAt?.toISOString(), // Convert Date
      // Avoid spreading ...message which might include non-serializable fields
    }));
  } catch (error) {
    console.error("Error fetching messages for conversation:", error);
    return [];
  }
}

/**
 * Mark messages in a conversation as read for the current user.
 */
export async function markConversationAsRead(conversationId) {
  try {
    const session = await auth();
    if (!session?.user)
      return { success: false, message: "Authentication required" };
    const userId = session.user.id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return { success: false, message: "Invalid conversation ID" };
    }

    await connectToDb();

    // Find the conversation first to get listingId and participants
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    })
      .select("listing participants")
      .lean();

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found or user not participant",
      };
    }

    // Update messages where the current user is the receiver and isRead is false,
    // matching the specific listing and participants of this conversation.
    const updateResult = await Message.updateMany(
      {
        listingId: conversation.listing,
        receiverId: userId,
        isRead: false,
        // Ensure the sender is the other participant(s)
        senderId: {
          $in: conversation.participants.filter((p) => p.toString() !== userId),
        },
      },
      { $set: { isRead: true } }
    );

    // console.log(`Marked ${updateResult.modifiedCount} messages as read for conversation ${conversationId}`);

    // Revalidate the main messages list to update unread indicators
    revalidatePath("/messages");

    // No need to return success:true if no messages were updated (updateResult.modifiedCount === 0)
    return { success: true, updatedCount: updateResult.modifiedCount };
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    return { success: false, message: "Failed to mark messages as read" };
  }
}
