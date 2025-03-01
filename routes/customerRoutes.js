const express = require("express");
const Customer = require("../models/Customer");

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newCustomer = new Customer({ name, email, password });
    await newCustomer.save();
    res.status(201).json({ msg: "Signup successful!" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Fetch All Customers Route (New)
router.get("/all", async (req, res) => {
  try {
    const customers = await Customer.find(); // Fetch all customers
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
