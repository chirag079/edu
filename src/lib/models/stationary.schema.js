import { User } from "./user.schema";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stationarySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Books",
        "Notes",
        "Stationary",
        "Electronics",
        "Furniture",
        "Clothing",
        "Other",
      ],
    },
    subCategory: {
      type: String,
      required: [true, "Sub-category is required"],
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: ["New", "Like New", "Good", "Fair", "Poor"],
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    college: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Available", "Pending", "Sold", "Archived"],
      default: "Available",
    },
    ratings: {
      type: [
        {
          userId: { type: Schema.Types.ObjectId, ref: "users" },
          rating: { type: Number, min: 1, max: 5 },
          review: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    metadata: {
      brand: String,
      model: String,
      year: Number,
      color: String,
      size: String,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
stationarySchema.index({ name: "text", description: "text" });
stationarySchema.index({ category: 1 });
stationarySchema.index({ college: 1 });
stationarySchema.index({ status: 1 });
stationarySchema.index({ location: "2dsphere" });
stationarySchema.index({ seller: 1 });
stationarySchema.index({ expiryDate: 1 });

// Virtual for getting time remaining
stationarySchema.virtual("timeRemaining").get(function () {
  const now = new Date();
  const diff = this.expiryDate - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))); // Days remaining
});

// Method to update average rating
stationarySchema.methods.updateAverageRating = async function () {
  const ratings = this.ratings;
  if (ratings.length === 0) {
    this.averageRating = 0;
    return;
  }
  const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
  this.averageRating = sum / ratings.length;
  await this.save();
};

// Pre-save middleware to ensure data consistency
stationarySchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "Sold") {
    this.expiryDate = new Date();
  }
  next();
});

// const Stationary = mongoose.model('Stationary', stationarySchema);

// export { Stationary };

export const Stationary =
  mongoose.models.stationaries ||
  mongoose.model("stationaries", stationarySchema);
