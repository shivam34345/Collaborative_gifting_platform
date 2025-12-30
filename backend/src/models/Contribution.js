const mongoose = require("mongoose");

const contributionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "confirmed"],
      default: "pending",
    },

    paymentProof: {
      type: String, // UPI reference / note
      trim: true,
    },

    paidAt: {
      type: Date,
    },

    confirmedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// 🔒 One contribution per user per group
contributionSchema.index({ user: 1, group: 1 }, { unique: true });

module.exports = mongoose.model("Contribution", contributionSchema);
