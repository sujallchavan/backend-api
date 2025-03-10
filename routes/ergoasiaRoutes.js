const express = require("express");
const router = express.Router();
const CustomerRequirement = require("../models/CustomerRequirement"); // Adjust the path if needed

// Route to fetch all customer requirements
router.get("/customer-requirements", async (req, res) => {
  try {
    const customerRequirements = await CustomerRequirement.find({});
    res.status(200).json(customerRequirements);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ API to update approval status
router.put("/update-approval/:order_id", async (req, res) => {
  try {
    const { isApproved } = req.body;

    // Validate input
    if (typeof isApproved !== "boolean") {
      return res
        .status(400)
        .json({ message: "Invalid approval status format" });
    }

    // Convert boolean to "Approved" or "Disapproved"
    const approvalStatus = isApproved ? "Approved" : "Disapproved";

    const updatedOrder = await CustomerRequirement.findOneAndUpdate(
      { _id: req.params.order_id }, // Ensure order_id is an ObjectId
      { isApproved: approvalStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Approval status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating approval status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
