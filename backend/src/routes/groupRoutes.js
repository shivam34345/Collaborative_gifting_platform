const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getGroupById } = require("../controllers/groupController");
const { deleteGroup } = require("../controllers/groupController");
const {
  createGroup,
  joinGroup,
  getMyGroups,
  confirmGift,
  openPayment,
  undoConfirmGift,
  
} = require("../controllers/groupController");

router.post("/create", protect, createGroup);
router.post("/join", protect, joinGroup);

// 👇 THIS ROUTE WAS MISSING
router.get("/my-groups", protect, getMyGroups);

router.get("/:id", protect, getGroupById);

router.patch("/:groupId/confirm-gift", protect, confirmGift);
router.patch("/:groupId/open-payment", protect, openPayment);
router.patch("/:groupId/undo-confirm", protect, undoConfirmGift);
router.delete("/:groupId", protect, deleteGroup);


module.exports = router;
