const express = require("express");
const Customer = require("../models/Customer");

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone_number, password } = req.body; // ✅ Added phone_number
    const newCustomer = new Customer({ name, email, phone_number, password });
    await newCustomer.save();
    res.status(201).json({ msg: "Signup successful!" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Fetch All Customers Route
router.get("/all", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
