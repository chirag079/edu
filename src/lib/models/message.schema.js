import mongoose from "mongoose";
import "./listing.schema.js"; // Import the Listing schema first

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing", // This will now work because we've imported the Listing model
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ listingId: 1 });
messageSchema.index({ createdAt: -1 });

export const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        archivedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for conversation schema
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessage: 1 });
conversationSchema.index({ listing: 1 });

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);
