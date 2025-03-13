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

const users = [{ email: "test@example.com", password: "123456" }];

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    res.status(200).json({ message: "Login successful!", user });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// ✅ Manufacturer Signup Route (Plain Password)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if manufacturer already exists
    const existingManufacturer = await Manufacturer.findOne({ email });
    if (existingManufacturer) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Save manufacturer to DB (Storing plain text password ⚠️ Not secure)
    const newManufacturer = new Manufacturer({
      name,
      email,
      password,
    });

    await newManufacturer.save();
    res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
