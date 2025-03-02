const express = require("express");
const Customer = require("../models/Customer");

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone_number, password } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ msg: "Customer already exists" });
    }

    const newCustomer = new Customer({ name, email, phone_number, password });
    await newCustomer.save();
    res.status(201).json({ msg: "Signup successful!" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Simple Login Route (No JWT)
// Simple Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and Password are required" });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email });

    // If no customer found
    if (!customer) {
      return res.status(404).json({ msg: "Customer not found" });
    }

    // Check if password matches (plain text match)
    if (customer.password !== password) {
      return res.status(401).json({ msg: "Incorrect password" });
    }

    // Successful login
    res.status(200).json({ msg: "Login successful", customer });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
