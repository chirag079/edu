const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "stationary",
      required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Completed",
        "Cancelled",
        "Refunded",
        "Disputed",
      ],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Other"],
      required: true,
    },
    paymentDetails: {
      type: Map,
      of: String,
    },
    meetingLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: String,
    },
    meetingTime: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot be more than 500 characters"],
    },
    dispute: {
      raisedBy: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
      reason: String,
      status: {
        type: String,
        enum: ["Open", "Resolved", "Closed"],
        default: "Open",
      },
      resolution: String,
      resolvedAt: Date,
    },
    feedback: {
      buyerRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      sellerRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      buyerReview: String,
      sellerReview: String,
    },
    metadata: {
      ipAddress: String,
      deviceInfo: String,
      browserInfo: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
transactionSchema.index({ product: 1 });
transactionSchema.index({ buyer: 1 });
transactionSchema.index({ seller: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ meetingLocation: "2dsphere" });

// Pre-save middleware to handle transaction updates
transactionSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "Completed") {
    this.feedback = this.feedback || {};
  }
  next();
});

// Method to check if transaction can be cancelled
transactionSchema.methods.canBeCancelled = function () {
  return this.status === "Pending" || this.status === "Processing";
};

// Method to check if feedback can be given
transactionSchema.methods.canGiveFeedback = function (userId) {
  if (this.status !== "Completed") return false;
  if (!this.feedback) return true;

  if (userId.toString() === this.buyer.toString()) {
    return !this.feedback.buyerRating;
  }
  if (userId.toString() === this.seller.toString()) {
    return !this.feedback.sellerRating;
  }
  return false;
};

export const Transaction =
  mongoose.models.transaction ||
  mongoose.model("transaction", transactionSchema);
