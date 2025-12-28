const Group = require("../models/Group");
const crypto = require("crypto");

// ============================
// CREATE GROUP
// ============================
const createGroup = async (req, res) => {
  try {
    const { name, description, organizerUpi } = req.body;

    // Validation
    if (!name || !organizerUpi) {
      return res.status(400).json({
        message: "Group name and organizer UPI ID are required",
      });
    }

    const inviteCode = crypto.randomBytes(4).toString("hex");

    const group = await Group.create({
      name,
      description,
      organizerUpi,                // ✅ added
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
      .populate("members", "name email");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createGroup,
  joinGroup,
  getMyGroups,
  getGroupById
};
