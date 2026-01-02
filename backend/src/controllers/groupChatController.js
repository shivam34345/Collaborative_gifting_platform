const GroupMessage = require("../models/GroupMessage");

/* GET messages of a group */
const getGroupMessages = async (req, res) => {
  try {
    const messages = await GroupMessage.find({
      group: req.params.groupId,
    })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to load messages" });
  }
};

/* SEND message */
const sendGroupMessage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const message = await GroupMessage.create({
      group: req.params.groupId,
      sender: req.user._id,
      text,
    });

    const populatedMessage = await message.populate("sender", "name");

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message" });
  }
};

module.exports = { getGroupMessages, sendGroupMessage };
