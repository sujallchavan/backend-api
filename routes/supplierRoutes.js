const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier"); // Import your Supplier model

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newSupplier = new Supplier({ name, email, password });
    await newSupplier.save();

    res
      .status(201)
      .json({ message: "Signup successful", user: { name, email } });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const supplier = await Supplier.findOne({ email });
    if (!supplier || supplier.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      user: { name: supplier.name, email: supplier.email },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router; // ✅ Export ONLY the router
