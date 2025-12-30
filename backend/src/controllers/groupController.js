const Group = require("../models/Group");
const Contribution = require("../models/Contribution");
const crypto = require("crypto");

// ============================
// CREATE GROUP
// ============================
const createGroup = async (req, res) => {
  try {
    const { name, description, organizerUpi } = req.body;

    if (!name || !organizerUpi) {
      return res.status(400).json({
        message: "Group name and organizer UPI ID are required",
      });
    }

    const inviteCode = crypto.randomBytes(4).toString("hex");

    const group = await Group.create({
      name,
      description,
      organizerUpi,
      createdBy: req.user._id,
      members: [req.user._id],
      inviteCode,
    });

    res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// JOIN GROUP
// ============================
const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const group = await Group.findOne({ inviteCode });
    if (!group) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: "Already a member" });
    }

    group.members.push(req.user._id);
    await group.save();

    res.json({
      message: "Joined group successfully",
      group,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// GET MY GROUPS
// ============================
const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user._id,
    }).select("_id name description inviteCode organizerUpi");

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// GET SINGLE GROUP BY ID
// ============================
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name email")
      .populate("finalGift");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// CONFIRM GIFT (ORGANIZER)
// ============================
const confirmGift = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { giftId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only organizer can confirm gift",
      });
    }

    group.finalGift = giftId;
    group.paymentOpen = false;
    await group.save();

    const populatedGroup = await Group.findById(groupId).populate("finalGift");

    res.json({
      message: "Gift confirmed successfully",
      group: populatedGroup,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// OPEN PAYMENT (ORGANIZER)
// ============================
const openPayment = async (req, res) => {
  try {
    // ✅ FIX: define groupId properly
    const { groupId } = req.params;

    console.log("🔥 openPayment called for group:", groupId);

    const group = await Group.findById(groupId).populate("members");
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only organizer
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only organizer can open payments",
      });
    }

    if (!group.finalGift) {
      return res.status(400).json({
        message: "Finalize gift before opening payments",
      });
    }

    if (group.paymentOpen) {
      return res.status(400).json({
        message: "Payment already opened",
      });
    }

    const memberCount = group.members.length;
    const amountPerUser = Math.ceil(1000 / memberCount); // temp amount

    // ✅ Create contributions
    for (const member of group.members) {
      console.log("Creating contribution for:", member._id);

      await Contribution.create({
        user: member._id,
        group: groupId,
        amount: amountPerUser,
      });
    }

    group.paymentOpen = true;
    await group.save();

    res.json({
      message: "Payment opened & contributions created",
    });

  } catch (error) {
    console.error("❌ openPayment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ============================
// UNDO CONFIRM GIFT
// ============================
const undoConfirmGift = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only organizer can undo" });
    }

    if (group.paymentOpen) {
      return res.status(400).json({
        message: "Cannot undo after payment has started",
      });
    }

    group.finalGift = null;
    await group.save();

    const populatedGroup = await Group.findById(groupId).populate("finalGift");

    res.json({
      message: "Finalized gift undone",
      group: populatedGroup,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createGroup,
  joinGroup,
  getMyGroups,
  getGroupById,
  confirmGift,
  openPayment,
  undoConfirmGift,
};
