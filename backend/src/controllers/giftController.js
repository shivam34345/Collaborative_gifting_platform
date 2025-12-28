const Gift = require("../models/Gift");

// ============================
// ADD GIFT SUGGESTION
// ============================
exports.addGift = async (req, res) => {
  try {
    const { name, image, link } = req.body;
    const { groupId } = req.params;

    if (!name || !image || !link) {
      return res.status(400).json({
        message: "Name, image URL, and product link are required",
      });
    }

    const gift = await Gift.create({
      group: groupId,
      name,
      image,
      link,
      suggestedBy: req.user._id,
      votes: [],
    });

    res.status(201).json(gift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// GET GIFTS OF A GROUP
// ============================
exports.getGroupGifts = async (req, res) => {
  try {
    const gifts = await Gift.find({ group: req.params.groupId })
      .populate("suggestedBy", "name");

    res.json(gifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// VOTE FOR A GIFT  ✅ ADD THIS
// ============================
exports.voteGift = async (req, res) => {
  try {
    const gift = await Gift.findById(req.params.id);

    if (!gift) {
      return res.status(404).json({ message: "Gift not found" });
    }

    // prevent double voting
    if (gift.votes.includes(req.user._id)) {
      return res.status(400).json({ message: "You have already voted" });
    }

    gift.votes.push(req.user._id);
    await gift.save();

    res.json({ message: "Vote added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
