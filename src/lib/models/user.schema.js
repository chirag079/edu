import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [30, "Name cannot exceed 30 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [20, "Username cannot exceed 20 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["admin", "advertiser", "explorer"],
      default: "explorer",
    },
    college: {
      type: String,
      enum: ["NSUT", "DTU", "IPU"],
      required: false,
      trim: true,
    },
    profileStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    hasProfilePicture: {
      type: Boolean,
      default: false,
    },
    wallet: {
      balance: {
        type: Number,
        default: 0,
      },
      transactions: [
        {
          type: {
            type: String,
            enum: ["recharge", "advertisement", "refund"],
            required: true,
          },
          amount: {
            type: Number,
            required: true,
          },
          description: String,
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    savedItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes
userSchema.index({ role: 1 });
userSchema.index({ college: 1 });

// Export the model
let User;
try {
  User = mongoose.model("User");
} catch {
  User = mongoose.model("User", userSchema);
}

export { User };
