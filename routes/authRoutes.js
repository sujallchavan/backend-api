const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const router = express.Router();

// Register Customer
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let customer = await Customer.findOne({ email });
    if (customer) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    customer = new Customer({ name, email, password: hashedPassword });
    await customer.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Login Customer
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let customer = await Customer.findOne({ email });
    if (!customer) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const token = jwt.sign({ id: customer._id }, "secretKey", {
      expiresIn: "1h",
    });

    res.json({
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
