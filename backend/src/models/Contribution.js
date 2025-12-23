const mongoose = require("mongoose");

const contributionSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "paid", "confirmed"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "manual"],
      default: "UPI"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contribution", contributionSchema);
