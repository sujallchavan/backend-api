const express = require("express");
const router = express.Router();
const CustomerRequirement = require("../models/CustomerRequirement"); // Adjust the path if needed
const Manufacturer = require("../models/Manufacturer"); // Ensure the correct path

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

// 🔑 LOGIN ROUTE (No bcrypt)
// ✅ Login Route with Session
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Manufacturer.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Store user email in session
    req.session.userEmail = user.email;

    res.status(200).json({
      message: "Login successful",
      user: { email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
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

// ✅ Route to Get Logged-in User Data
router.get("/user", (req, res) => {
  if (!req.session.userEmail) {
    return res.status(401).json({ error: "Not logged in" });
  }

  res.json({ email: req.session.userEmail, name: "User" }); // Fetch name from DB if needed
});

// ✅ Logout Route
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// ✅ Route to Fetch User Data by Email from sessionStorage
router.get("/user/:email", async (req, res) => {
  try {
    const email = req.params.email; // Get email from URL param
    const user = await Manufacturer.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ email: user.email, name: user.name });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
