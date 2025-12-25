const GiftSuggestion = require("../models/GiftSuggestion");
const Group = require("../models/Group");

// ADD SUGGESTION
exports.addSuggestion = async (req, res) => {
  try {
    const { groupId, title, description } = req.body;

    if (!groupId || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Not a group member" });
    }

    const suggestion = await GiftSuggestion.create({
      group: groupId,
      suggestedBy: req.user._id,   // ✅ FIX
      title,
      description,
    });

    res.status(201).json({
      message: "Suggestion added",
      suggestion,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VOTE SUGGESTION
exports.voteSuggestion = async (req, res) => {
  try {
    const { suggestionId } = req.body;

    const suggestion = await GiftSuggestion.findById(suggestionId);
    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" });
    }

    const group = await Group.findById(suggestion.group);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Not a group member" });
    }

    const alreadyVoted = suggestion.votes.some(
      (v) => v.toString() === req.user._id.toString()
    );

    if (alreadyVoted) {
      return res.status(400).json({ message: "Already voted" });
    }

    suggestion.votes.push(req.user._id);   // ✅ FIX
    await suggestion.save();

    res.json({
      message: "Vote added successfully",
      votesCount: suggestion.votes.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SUGGESTIONS
exports.getSuggestionsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const suggestions = await GiftSuggestion.find({ group: groupId })
      .populate("suggestedBy", "name")
      .sort({ createdAt: -1 });

    res.json(
      suggestions.map((s) => ({
        _id: s._id,
        title: s.title,
        description: s.description,
        votesCount: s.votes.length,
        suggestedBy: s.suggestedBy,
        createdAt: s.createdAt,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
