const express = require("express");
const router = express.Router();

const {
  createGroup,
  joinGroup
} = require("../controllers/groupController");

const protect = require("../middleware/authMiddleware");

router.post("/create", protect, createGroup);
router.post("/join", protect, joinGroup);

module.exports = router;
