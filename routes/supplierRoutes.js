const express = require("express");
const bcrypt = require("bcryptjs");
const Supplier = require("../models/Supplier");

const router = express.Router();

// Supplier Signup Route
router.post("/signup", async (req, res) => {
  const { name, email, password, category } = req.body;

  try {
    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSupplier = new Supplier({
      name,
      email,
      password: hashedPassword,
      category,
    });

    await newSupplier.save();
    res.status(201).json({ message: "Supplier registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error registering supplier", error });
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

module.exports = router;
