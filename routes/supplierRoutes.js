const express = require("express");
const bcrypt = require("bcryptjs");
const Supplier = require("../models/Supplier");
const CustomerRequirement = require("../models/CustomerRequirement");

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      category,
      phoneNumber,
      companyName,
      location,
    } = req.body;

    // Check if email already exists
    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new supplier
    const newSupplier = new Supplier({
      name,
      email,
      password: hashedPassword,
      category,
      phoneNumber,
      companyName,
      location,
    });

    await newSupplier.save();
    res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const supplier = await Supplier.findOne({ email });
    if (!supplier) {
      return res.status(400).json({ message: "Supplier not found" });
    }

    const isMatch = await bcrypt.compare(password, supplier.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", supplier });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Fetch Customer Orders Based on Supplier's Category
router.get("/orders", async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const orders = await CustomerRequirement.find({ category });

    if (orders.length === 0) {
      return res.json([]);
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
