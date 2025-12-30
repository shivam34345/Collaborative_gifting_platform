const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    inviteCode: {
      type: String,
      unique: true,
      required: true
    },
    organizerUpi: {
  type: String,
  required: true,
},
finalGift: {
  type: mongoose.Schema.Types.ObjectId,
      ref: "Gift", // MUST match your gift model name
      default: null,
},
paymentOpen: {
  type: Boolean,
  default: false,
},


  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
