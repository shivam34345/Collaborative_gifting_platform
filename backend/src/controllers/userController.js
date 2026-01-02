const User = require("../models/User");

const updateName = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        message: "Name must be at least 3 characters",
      });
    }

    const existingUser = await User.findOne({ name });

    if (
      existingUser &&
      existingUser._id.toString() !== req.user._id.toString()
    ) {
      return res.status(400).json({
        message: "Name already taken",
      });
    }

    req.user.name = name;
    await req.user.save();

    res.json({
      message: "Name updated successfully",
      name: req.user.name,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateName };
