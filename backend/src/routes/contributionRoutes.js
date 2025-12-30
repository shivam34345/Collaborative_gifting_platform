const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getGroupContributions,
  addPaymentProof,
  markAsPaid,
  confirmPayment,
} = require("../controllers/contributionController");

router.get("/:groupId", protect, getGroupContributions);
router.patch("/:id/proof", protect, addPaymentProof);
router.patch("/:id/mark-paid", protect, markAsPaid);
router.patch("/:id/confirm", protect, confirmPayment);

module.exports = router;
