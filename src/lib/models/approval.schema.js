const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const approvalSchema = new Schema(
  {
    onModel: {
      type: String,
      enum: ["Stationary", "Flat", "Event", "Restaurant"],
      required: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      refPath: "onModel",
      required: true,
    },
    itemType: {
      type: String,
      required: true,
      enum: ["Stationary", "Flat", "Event", "Restaurant"],
    },
    approvalStatus: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
    advertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    college: {
      type: String,
      required: true,
    },
    calculatedCost: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
approvalSchema.index({ approvalStatus: 1, college: 1 });
approvalSchema.index({ advertiser: 1, approvalStatus: 1 });

export const Approval =
  mongoose.models.Approval || mongoose.model("Approval", approvalSchema);
