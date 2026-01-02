const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getGroupContributions,
  addPaymentProof,
  markAsPaid,
  confirmPayment,
  getMyTotalContributions,
} = require("../controllers/contributionController");

/* ✅ SPECIFIC ROUTES FIRST */
router.get("/my-total", protect, getMyTotalContributions);

/* ✅ GROUP-SPECIFIC ROUTES AFTER */
router.get("/:groupId", protect, getGroupContributions);
router.patch("/:id/proof", protect, addPaymentProof);
router.patch("/:id/mark-paid", protect, markAsPaid);
router.patch("/:id/confirm", protect, confirmPayment);

module.exports = router;
