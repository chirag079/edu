import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    itemType: {
      type: String,
      required: true,
      enum: ["Stationary", "Flat/PG", "Restaurant", "Event"],
    },
    price: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    advertiserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    college: {
      type: String,
      required: true,
    },
    // Additional fields based on itemType
    mrp: Number, // For Stationary
    rent: Number, // For Flat/PG
    location: String, // For Flat/PG, Restaurant
    bedrooms: Number, // For Flat/PG
    bathrooms: Number, // For Flat/PG
    cuisine: [String], // For Restaurant
    eventDate: Date, // For Event
    category: String, // For Event
    organizer: String, // For Event
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
listingSchema.index({ itemType: 1, status: 1 });
listingSchema.index({ advertiserId: 1 });
listingSchema.index({ college: 1 });
listingSchema.index({ createdAt: -1 });

export const Listing =
  mongoose.models.Listing || mongoose.model("Listing", listingSchema);
