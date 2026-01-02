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

    // 🔐 Only organizer can confirm
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

    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Invalid contribution amount",
      });
    }

    // ✅ STORE ACTUAL PAID AMOUNT
    contribution.amount = Number(amount);
    contribution.status = "confirmed";
    contribution.confirmedAt = new Date();

    await contribution.save();

    res.json({
      message: "Payment confirmed",
      contribution,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// ============================
// GET MY TOTAL CONTRIBUTIONS
// ============================
async function getMyTotalContributions(req, res) {
  try {
    // ✅ Only confirmed contributions should count
    const contributions = await Contribution.find({
      user: req.user._id,
      status: "confirmed",
    }).populate("group", "name");

    const grouped = {};
    let total = 0;

    contributions.forEach((c) => {
      const groupName = c.group?.name || "Unknown Group";

      // 🔥 IMPORTANT: use ACTUAL amount paid
      const amount = Number(c.amount) || 0;

      grouped[groupName] = (grouped[groupName] || 0) + amount;
      total += amount;
    });

    res.json({
      email: req.user.email,
      groups: Object.entries(grouped).map(([groupName, amount]) => ({
        groupName,
        amount,
      })),
      total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


module.exports = {
  getGroupContributions,
  addPaymentProof,
  markAsPaid,
  confirmPayment,
  getMyTotalContributions,
};
