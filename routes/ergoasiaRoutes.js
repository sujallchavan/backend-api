const express = require("express");
const router = express.Router();
const CustomerRequirement = require("../models/CustomerRequirement"); // Adjust the path if needed
const Manufacturer = require("../models/Manufacturer"); // Ensure the correct path
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const mongoose = require("mongoose");

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

// In your Node.js backend routes file
router.put("/complete-order/:order_id", async (req, res) => {
  console.log("Received PUT to complete-order with ID:", req.params.order_id);
  try {
    const { order_id } = req.params;

    // Validate the order exists and is final approved
    const order = await CustomerRequirement.findOne({
      order_id: order_id,
      isFinalApproved: "Approved",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not final approved",
      });
    }

    // Update working status to "Completed"
    const updatedOrder = await CustomerRequirement.findOneAndUpdate(
      { order_id: order_id },
      { $set: { working_status: "Completed" } },
      { new: true }
    );

    res.json({
      success: true,
      message: "Order marked as completed",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({
      success: false,
      message: "Server error completing order",
    });
  }
});

// In your Node.js backend routes file
router.put("/reject-order/:order_id", async (req, res) => {
  console.log("Received PUT to reject-order with ID:", req.params.order_id);
  try {
    const { order_id } = req.params;

    // Validate the order exists and is final approved
    const order = await CustomerRequirement.findOne({
      order_id: order_id,
      isFinalApproved: "Approved",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not final approved",
      });
    }

    // Update isFinalApproved to "Disapproved"
    const updatedOrder = await CustomerRequirement.findOneAndUpdate(
      { order_id: order_id },
      { $set: { isFinalApproved: "Disapproved" } },
      { new: true }
    );

    res.json({
      success: true,
      message: "Order has been rejected",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error rejecting order:", error);
    res.status(500).json({
      success: false,
      message: "Server error rejecting order",
    });
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
    res.status(500).json({ error: "Internal server errorv" });
  }
});

// ✅ Route to fetch only approved customer requirements
router.get("/approved-requirements", async (req, res) => {
  try {
    const approvedRequirements = await CustomerRequirement.find({
      isApproved: "Approved",
    });
    res.status(200).json(approvedRequirements);
  } catch (error) {
    console.error("Error fetching approved projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// In your routes file
router.get("/api/manufacturer/customers", async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ GET /api/manufacturer/customers
router.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Make sure to export the router

// Fetch all suppliers
router.get("/suppliers", async (req, res) => {
  try {
    const suppliers = await Supplier.find({});
    res.status(200).json(suppliers); // Respond with all suppliers in JSON format
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE customer route
router.delete("/customers/:id", async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

// DELETE supplier route
// DELETE supplier route
router.delete("/suppliers/:id", async (req, res) => {
  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!deletedSupplier) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

// Add these routes to your existing router

// GET single customer by ID
router.get("/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET single supplier by ID
router.get("/suppliers/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.status(200).json(supplier);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// UPDATE customer
router.put("/customers/:id", async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(200).json({
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// UPDATE supplier
router.put("/suppliers/:id", async (req, res) => {
  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedSupplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.status(200).json({
      message: "Supplier updated successfully",
      supplier: updatedSupplier,
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
