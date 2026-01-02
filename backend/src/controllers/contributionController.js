const Contribution = require("../models/Contribution");
const Group = require("../models/Group");

// ============================
// GET ALL CONTRIBUTIONS OF A GROUP
// ============================
const getGroupContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({
      group: req.params.groupId,
    })
      .populate("user", "name email")
      .sort({ createdAt: 1 });

    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// ADD PAYMENT PROOF (USER)
// ============================
const addPaymentProof = async (req, res) => {
  try {
    const { paymentProof } = req.body;

    if (!paymentProof || paymentProof.trim().length < 3) {
      return res.status(400).json({
        message: "Valid payment proof is required",
      });
    }

    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    if (contribution.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (contribution.status !== "pending") {
      return res.status(400).json({
        message: "Cannot add proof after marking paid",
      });
    }

    contribution.paymentProof = paymentProof;
    contribution.paidAt = new Date();
    await contribution.save();

    res.json({ message: "Payment proof added", contribution });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// MARK AS PAID (USER)
// ============================
const markAsPaid = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    if (contribution.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!contribution.paymentProof) {
      return res.status(400).json({ message: "Add payment proof first" });
    }

    if (contribution.status !== "pending") {
      return res.status(400).json({ message: "Already marked" });
    }

    contribution.status = "paid";
    await contribution.save();

    res.json({
      message: "Marked as paid, awaiting organizer confirmation",
      contribution,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// CONFIRM PAYMENT (ORGANIZER)
// ============================
const confirmPayment = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    const group = await Group.findById(contribution.group);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only organizer can confirm payments",
      });
    }

    if (contribution.status !== "paid") {
      return res.status(400).json({
        message: "Only paid contributions can be confirmed",
      });
    }

    contribution.status = "confirmed";
    contribution.confirmedAt = new Date();
    await contribution.save();

    res.json({ message: "Payment confirmed", contribution });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// GET MY TOTAL CONTRIBUTIONS
// ============================
const getMyTotalContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({
      user: req.user._id,
    }).populate("group", "name");

    const grouped = {};
    contributions.forEach((c) => {
      const name = c.group?.name || "Unknown Group";
      grouped[name] = (grouped[name] || 0) + c.amount;
    });

    res.json({
      email: req.user.email,
      groups: Object.entries(grouped).map(([groupName, amount]) => ({
        groupName,
        amount,
      })),
      total: Object.values(grouped).reduce((a, b) => a + b, 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGroupContributions,
  addPaymentProof,
  markAsPaid,
  confirmPayment,
  getMyTotalContributions,
};
