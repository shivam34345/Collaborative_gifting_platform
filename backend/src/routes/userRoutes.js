const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { updateName } = require("../controllers/userController");

router.patch("/name", protect, updateName);

module.exports = router;
