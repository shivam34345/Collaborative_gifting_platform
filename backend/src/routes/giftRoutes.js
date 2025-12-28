const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  addGift,
  getGroupGifts,
  voteGift,
} = require("../controllers/giftController");

router.post("/:groupId", protect, addGift);
router.get("/:groupId", protect, getGroupGifts);
router.post("/:id/vote", protect, voteGift);

module.exports = router;
