import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    coordinates: {
      type: [Number],
      required: false,
    },
    category: {
      type: String,
      enum: ["Academic", "Cultural", "Sports", "Social", "Workshop", "Other"],
      required: true,
    },
    images: [String],
    organizer: {
      type: String,
      required: true,
    },
    contact: {
      email: String,
      phone: String,
      website: String,
    },
    registrationRequired: {
      type: Boolean,
      default: false,
    },
    registrationLink: String,
    maxParticipants: Number,
    currentParticipants: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    tags: [String],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    calculatedCost: {
      type: Number,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    college: {
      type: String,
      required: true,
      enum: ["NSUT", "DTU", "IPU"],
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for date-based queries
eventSchema.index({ startDate: 1, endDate: 1 });

// Add text index for search
eventSchema.index({ title: "text", description: "text", tags: "text" });

export const Event =
  mongoose.models.Event || mongoose.model("Event", eventSchema);
