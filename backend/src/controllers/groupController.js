const Group = require("../models/Group");
const crypto = require("crypto");

// CREATE GROUP
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const inviteCode = crypto.randomBytes(4).toString("hex");

    const group = await Group.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
      inviteCode
    });

    res.status(201).json({
      message: "Group created successfully",
      group
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// JOIN GROUP
const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const group = await Group.findOne({ inviteCode });

    if (!group) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    group.members.push(req.user._id);
    await group.save();

    res.status(200).json({
      message: "Joined group successfully",
      group
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createGroup, joinGroup };
