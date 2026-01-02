const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getGroupMessages,
  sendGroupMessage,
} = require("../controllers/groupChatController");

router.get("/:groupId/messages", protect, getGroupMessages);
router.post("/:groupId/messages", protect, sendGroupMessage);

module.exports = router;
