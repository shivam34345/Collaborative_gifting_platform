const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getGroupById } = require("../controllers/groupController");
const {
  createGroup,
  joinGroup,
  getMyGroups
} = require("../controllers/groupController");

router.post("/create", protect, createGroup);
router.post("/join", protect, joinGroup);

// 👇 THIS ROUTE WAS MISSING
router.get("/my-groups", protect, getMyGroups);

router.get("/:id", protect, getGroupById);


module.exports = router;
