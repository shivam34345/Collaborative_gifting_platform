const Contribution = require("../models/Contribution");
const Group = require("../models/Group");

/**
 * @desc    Add contribution amount
 * @route   POST /api/contribution/add
 * @access  Private (Group Members Only)
 */
exports.addContribution = async (req, res) => {
  try {
    const { groupId, amount } = req.body;

    // Basic validation
    if (!groupId || amount === undefined) {
      return res
        .status(400)
        .json({ message: "Group ID and amount are required" });
    }

    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be greater than zero" });
    }

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a group member
    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    // Create contribution
    const contribution = await Contribution.create({
      user: req.user._id,
      group: groupId,
      amount,
    });

    res.status(201).json({
      message: "Contribution added successfully",
      contribution,
    });
  } catch (error) {
    // Duplicate contribution (unique index: user + group)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already contributed to this group",
      });
    }

    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Generate UPI payment URL for a contribution
 * @route   GET /api/contribution/:id/upi-link
 * @access  Private (Contributor only)
 */
exports.getUpiPaymentLink = async (req, res) => {
  try {
    const contributionId = req.params.id;

    // Fetch contribution
    const contribution = await Contribution.findById(contributionId);
    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    // Only contributor can generate payment link
    if (contribution.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Fetch group
    const group = await Group.findById(contribution.group);
    if (!group || !group.organizerUpi) {
      return res
        .status(400)
        .json({ message: "Organizer UPI not available" });
    }

    const amount = contribution.amount;
    const upiId = group.organizerUpi;
    const note = `${group.name} Gift`;

    // Generate UPI deep link
    const upiUrl = `upi://pay?pa=${upiId}&pn=Gift Organizer&am=${amount}&tn=${encodeURIComponent(
      note
    )}`;

    res.json({ upiUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
/**
 * @desc    Mark contribution as paid (user confirmation)
 * @route   PATCH /api/contribution/:id/mark-paid
 * @access  Private (Contributor only)
 */
exports.markContributionAsPaid = async (req, res) => {
  try {
    const contributionId = req.params.id;
    const { paymentNote } = req.body;

    const contribution = await Contribution.findById(contributionId);
    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    // Only contributor can mark as paid
    if (contribution.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (contribution.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Contribution cannot be marked as paid" });
    }

    contribution.status = "paid";
    if (paymentNote) {
      contribution.paymentNote = paymentNote;
    }

    await contribution.save();

    res.json({
      message: "Contribution marked as paid",
      contribution,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Organizer confirms contribution payment
 * @route   PATCH /api/contribution/:id/confirm
 * @access  Private (Organizer only)
 */
exports.confirmContribution = async (req, res) => {
  try {
    const contributionId = req.params.id;

    const contribution = await Contribution.findById(contributionId);
    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    if (contribution.status !== "paid") {
      return res
        .status(400)
        .json({ message: "Only paid contributions can be confirmed" });
    }

    const group = await Group.findById(contribution.group);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only organizer can confirm
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only organizer can confirm payments" });
    }

    contribution.status = "confirmed";
    await contribution.save();

    res.json({
      message: "Contribution confirmed successfully",
      contribution,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
