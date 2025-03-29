const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Supplier = require("../models/Supplier");
const CustomerRequirement = require("../models/CustomerRequirement");

const router = express.Router();

// ✅ Supplier Signup
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

// ✅ Supplier Login
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

// ✅ Fetch Orders Based on Supplier's Category
router.get("/orders", async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const orders = await CustomerRequirement.find({ category }).populate(
      "supplierResponses.supplier_Id",
      "name email"
    );

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/orders/respond", async (req, res) => {
  try {
    const { order_id, supplierId, status } = req.body;

    // ✅ Validate required fields
    if (!order_id || !supplierId || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Convert to correct data types
    const orderIdNum = parseInt(order_id);
    const supplierIdNum = parseInt(supplierId);

    if (isNaN(orderIdNum) || isNaN(supplierIdNum)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    // ✅ Find order by order_id
    const order = await CustomerRequirement.findOne({ order_id: orderIdNum });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ✅ Check if supplier already responded
    const existingResponse = order.supplierResponses.find(
      (resp) => resp.supplier_Id === supplierIdNum
    );

    if (existingResponse) {
      existingResponse.status = status;
    } else {
      order.supplierResponses.push({
        supplier_Id: supplierIdNum,
        status: status,
      });
    }

    // ✅ Save changes
    await order.save();

    res.json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("❌ Error updating order:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
