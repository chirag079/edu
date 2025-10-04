import { User } from "./user.schema";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const flatSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: { type: String },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    availableCollege: { type: String, default: " " },
    approvalStatus: {
      type: String,
      enum: ["Approved", "Pending", "Declined"],
      default: "Pending",
    },
    tags: [
      {
        type: String,
        required: true,
      },
    ],
    available: {
      type: Boolean,
      default: true,
    },
    capacity: { type: Number, default: 1 },
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    borrowers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  { timestamps: true }
);

export const Flat =
  mongoose.models.flats || mongoose.model("flats", flatSchema);
