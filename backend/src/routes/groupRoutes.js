const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createGroup,
  joinGroup,
  getMyGroups
} = require("../controllers/groupController");

router.post("/create", protect, createGroup);
router.post("/join", protect, joinGroup);

// 👇 THIS ROUTE WAS MISSING
router.get("/my-groups", protect, getMyGroups);

module.exports = router;
