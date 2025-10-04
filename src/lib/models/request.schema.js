const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchaseSchema = new Schema(
  {
    onModel: {
      type: String,
      enum: ["stationaries", "flats"],
      required: true,
    },
    Model: {
      type: Schema.Types.ObjectId,
      refPath: "onModel",
      required: true,
    },

    approvalStatus: {
      type: String,
      enum: ["Approved", "Pending", "Declined"],
      default: "Pending",
    },

    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

export const Request =
  mongoose.models.requests || mongoose.model("requests", purchaseSchema);
