const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "MESSAGE",
        "TRANSACTION",
        "RATING",
        "SYSTEM",
        "PROMOTION",
        "ALERT",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, "Message cannot be more than 500 characters"],
    },
    data: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    expiresAt: {
      type: Date,
    },
    action: {
      type: {
        type: String,
        enum: ["URL", "MODAL", "NONE"],
        default: "NONE",
      },
      value: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 });

// Pre-save middleware to handle notification updates
notificationSchema.pre("save", function (next) {
  if (this.isModified("isRead") && this.isRead) {
    this.readAt = new Date();
  }
  next();
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
};

// Method to check if notification is expired
notificationSchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Static method to create system notification
notificationSchema.statics.createSystemNotification = async function (
  userId,
  title,
  message,
  data = {}
) {
  return this.create({
    user: userId,
    type: "SYSTEM",
    title,
    message,
    data,
    priority: "MEDIUM",
  });
};

export const Notification =
  mongoose.models.notification ||
  mongoose.model("notification", notificationSchema);
