import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        // required: false // Coordinates are optional
      },
      // required: false // Entire location object is optional
    },
    cuisine: {
      type: [String],
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    openingHours: {
      type: Map,
      of: {
        open: String,
        close: String,
      },
      // required: false
    },
    contact: {
      phone: String,
      email: String,
      website: String,
      // required: false
    },
    features: {
      type: [String], // e.g., "Outdoor Seating", "Takeout", "Delivery"
      default: [],
    },
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

// Keep index if location might be used later
restaurantSchema.index({ location: "2dsphere" });

// Add text index for search
restaurantSchema.index({ name: "text", description: "text", cuisine: "text" });

export const Restaurant =
  mongoose.models.Restaurant || mongoose.model("Restaurant", restaurantSchema);
