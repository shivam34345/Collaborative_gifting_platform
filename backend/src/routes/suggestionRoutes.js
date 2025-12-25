const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  addSuggestion,
  voteSuggestion,
  getSuggestionsByGroup,
} = require("../controllers/suggestionController");

const router = express.Router();

router.post("/add", protect, addSuggestion);
router.post("/vote", protect, voteSuggestion);
router.get("/:groupId", protect, getSuggestionsByGroup);

module.exports = router;
