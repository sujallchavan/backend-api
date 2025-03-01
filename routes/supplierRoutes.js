const express = require("express");
const Customer = require("../models/Customer");

const router = express.Router();

// Route to fetch all customers from the customerDB
router.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
