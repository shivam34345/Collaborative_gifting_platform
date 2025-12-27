const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  addContribution,
   getUpiPaymentLink,
   markContributionAsPaid,
    confirmContribution,
} = require("../controllers/contributionController");

router.post("/add", protect, addContribution);
router.get("/:id/upi-link", protect, getUpiPaymentLink);
router.patch("/:id/mark-paid", protect, markContributionAsPaid);
router.patch("/:id/confirm", protect, confirmContribution);




module.exports = router;
