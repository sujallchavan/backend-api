const express = require("express");
const Customer = require("../models/Customer");
const LoginHistory = require("../models/loginHistory");
const Supplier = require("../models/Supplier");
const multer = require("multer");
const path = require("path");

const Manufacturer = require("../models/Manufacturer"); // Adjust path if needed

const CustomerRequirement = require("../models/CustomerRequirement");

const router = express.Router();

// Add this before any other middleware
router.post("/accept-supplier-response", async (req, res) => {
  try {
    console.log("Accept supplier endpoint hit"); // Debug log

    const { order_id, customer_id, supplier_Id } = req.body;

    // Validate input
    if (!order_id || !customer_id || !supplier_Id) {
      console.log("Missing fields", req.body); // Debug log
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const order = await CustomerRequirement.findOne({
      order_id: Number(order_id),
      customer_id: Number(customer_id),
    });

    if (!order) {
      console.log("Order not found", { order_id, customer_id }); // Debug log
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    const supplierResponse = order.supplierResponses.find(
      (r) => r.supplier_Id === Number(supplier_Id) && r.status === "Accepted"
    );

    if (!supplierResponse) {
      console.log("Supplier not accepted", { supplier_Id }); // Debug log
      return res.status(400).json({
        success: false,
        error: "Supplier hasn't accepted this order",
      });
    }

    if (order.isSupplierAccepted) {
      console.log("Supplier already accepted"); // Debug log
      return res.status(400).json({
        success: false,
        error: "Supplier already accepted for this order",
      });
    }

    order.acceptedSupplier = {
      supplier_Id: Number(supplier_Id),
      acceptedAt: new Date(),
    };
    order.isSupplierAccepted = true;
    order.working_status = "Working";

    await order.save();

    console.log("Supplier accepted successfully"); // Debug log
    return res.status(200).json({
      success: true,
      message: "Supplier successfully accepted",
      order,
    });
  } catch (error) {
    console.error("SERVER ERROR:", error); // Debug log
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, location, phone_number, password } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ msg: "Customer already exists" });
    }

    // Generate a unique 4-digit ID
    let uniqueId;
    let idExists;
    do {
      uniqueId = Math.floor(1000 + Math.random() * 9000).toString(); // Generate random 4-digit ID
      idExists = await Customer.findOne({ customer_id: uniqueId });
    } while (idExists); // Ensure uniqueness

    const newCustomer = new Customer({
      customer_id: uniqueId, // Assign generated ID
      name,
      email,
      location,
      phone_number,
      password,
    });

    await newCustomer.save();
    res.status(201).json({ msg: "Signup successful!", customer_id: uniqueId });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const customer = await Customer.findOne({ email });

    if (!customer || customer.password !== password) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    // ✅ Store login event in LoginHistory collection
    const loginEntry = new LoginHistory({
      customer_id: customer.customer_id,
      email: customer.email,
      login_time: new Date(),
    });

    await loginEntry.save();

    // ✅ Return customer data + login history
    const loginHistory = await LoginHistory.find({ email }).sort({
      login_time: -1,
    });

    res.status(200).json({
      msg: "Login successful",
      customer,
      loginHistory, // Send login history to frontend
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Fetch login history by email
router.get("/history/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email); // Decode URL-encoded email
    console.log("🔍 Fetching login history for:", email);

    const history = await LoginHistory.find({ email }).sort({ login_time: -1 });

    if (!history.length) {
      return res.status(404).json({ msg: "No login history found." });
    }

    res.status(200).json(history);
  } catch (error) {
    console.error("❌ Fetch Login History Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Logout Route (Destroy session)
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ msg: "Logout failed" });
    }
    res.status(200).json({ msg: "Logout successful" });
  });
});

// ✅ Ensure this route exists
router.get("/all", async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.json(customers);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Store files in 'uploads/' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const generateOrderId = async () => {
  let orderId;
  let isUnique = false;

  while (!isUnique) {
    orderId = String(Math.floor(100 + Math.random() * 900)); // Generate random 3-digit number (100-999)

    // Check if this Order ID already exists
    const existingOrder = await CustomerRequirement.findOne({
      order_id: orderId,
    });
    if (!existingOrder) {
      isUnique = true;
    }
  }
  return orderId;
};

router.post(
  "/submit-requirement",
  upload.single("pdf_file"),
  async (req, res) => {
    try {
      console.log("Received Data:", req.body); // Debugging line

      const {
        cname,
        customer_id,
        pname,
        Part_Name,
        category,
        email,
        phone_number,
        cpno,
        tv,
        desc,
        blank_name,
        pr,
        av,
        qs,
        sop,
        working_status,
      } = req.body;

      if (!phone_number) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      const pdf_file = req.file ? req.file.path : "";
      const order_id = Math.floor(100 + Math.random() * 900);

      const newRequirement = new CustomerRequirement({
        order_id,
        customer_id,
        cname,
        pname,
        Part_Name,
        category,
        email,
        phone_number,
        cpno,
        tv,
        desc,
        blank_name,
        pr,
        av,
        qs,
        sop,
        working_status,
        pdf_file,
      });

      await newRequirement.save();

      res
        .status(201)
        .json({ message: "Customer requirement saved successfully", order_id });
    } catch (error) {
      console.error("Error saving requirement:", error);
      res.status(500).json({ error: "Failed to save requirement" });
    }
  }
);

router.get("/orders/:customer_id", async (req, res) => {
  try {
    const { customer_id } = req.params;

    // Ensure customer_id is a number
    const numericCustomerId = Number(customer_id);
    if (isNaN(numericCustomerId)) {
      return res.status(400).json({ error: "Invalid customer ID" });
    }

    const orders = await CustomerRequirement.find({
      customer_id: numericCustomerId,
    });

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this customer." });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

router.get("/total-orders", async (req, res) => {
  try {
    if (!req.session || !req.session.customer_id) {
      return res.status(401).json({ msg: "Unauthorized. Please log in." });
    }

    const customerId = req.session.customer_id;
    console.log("Customer ID:", customerId); // Debugging

    // Fetch only total and pending orders
    const totalOrders = await CustomerRequirement.countDocuments({
      customer_id: customerId,
    });
    const pendingOrders = await CustomerRequirement.countDocuments({
      customer_id: customerId,
      working_status: "Pending",
    });

    console.log("Total:", totalOrders, "Pending:", pendingOrders); // Debugging

    res.status(200).json({ totalOrders, pendingOrders });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get orders with supplier responses for a specific customer
router.get("/orders/:customer_id", async (req, res) => {
  try {
    const { customer_id } = req.params;

    // Find all orders for this customer with supplier responses
    const orders = await CustomerRequirement.find({
      customer_id: Number(customer_id),
    }).populate({
      path: "supplierResponses.supplier_Id",
      select: "name email", // Include supplier details if needed
    });

    // Transform data to include supplier acceptance count
    const enhancedOrders = orders.map((order) => {
      const acceptedSuppliers = order.supplierResponses.filter(
        (response) => response.status === "Accepted"
      ).length;

      return {
        ...order._doc,
        acceptedSuppliers,
        totalResponses: order.supplierResponses.length,
      };
    });

    res.status(200).json(enhancedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Add this route to your existing routes
// Add this route to your existing routes (replace the existing one)
// Add this route to handle approved orders
// Add this route to handle approved orders
router.get("/approved-orders/:customer_id", async (req, res) => {
  try {
    const { customer_id } = req.params;
    const numericCustomerId = Number(customer_id);

    // Find orders for this customer that are approved
    const approvedOrders = await CustomerRequirement.find({
      customer_id: numericCustomerId,
      isApproved: "Approved", // Changed from "Disapproved" to "Approved"
    }).sort({ createdAt: -1 });

    if (!approvedOrders || approvedOrders.length === 0) {
      return res.status(404).json({
        message: "No approved orders found for this customer",
        customer_id: numericCustomerId,
      });
    }

    res.status(200).json(approvedOrders);
  } catch (error) {
    console.error("Error fetching approved orders:", error);
    res.status(500).json({
      message: "Failed to fetch approved orders",
      error: error.message,
    });
  }
});

// Update order endpoint
// Add this to your backend routes
// Update order endpoint
// Add this route to handle order updates
router.put("/order/:order_id", async (req, res) => {
  try {
    const orderId = req.params.order_id;
    const updateData = req.body;

    // Make sure to set proper headers
    res.setHeader("Content-Type", "application/json");

    const updatedOrder = await CustomerRequirement.findOneAndUpdate(
      { order_id: orderId },
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order",
    });
  }
});

// Delete order endpoint
router.delete("/order/:order_id", async (req, res) => {
  try {
    const { order_id } = req.params;

    const deletedOrder = await CustomerRequirement.findOneAndDelete({
      order_id: Number(order_id),
    });

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// GET /api/customer/:id/orders
router.get("/:id/orders", async (req, res) => {
  try {
    const customerId = req.params.id;
    const orders = await Order.find({
      customerId,
      acceptedSupplier: { $ne: null },
    });
    res.json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch customer orders with suppliers" });
  }
});

// GET /api/supplier/by-number/:supplierId
router.get("/by-number/:supplierId", async (req, res) => {
  try {
    const supplierId = parseInt(req.params.supplierId);
    const supplier = await Supplier.findOne({ supplierId }); // assuming schema: supplierId: Number
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: "Error fetching supplier" });
  }
});

// Get orders with supplier assignments for a specific customer
router.get("/orders/:customer_id", async (req, res) => {
  try {
    const customer_id = parseInt(req.params.customer_id);

    // Validate customer ID
    if (isNaN(customer_id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid customer ID format",
      });
    }

    // Find orders with supplier assignments
    const orders = await CustomerRequirement.find({
      customer_id: customer_id,
      acceptedSupplier: { $exists: true, $ne: null },
    }).sort({ createdAt: -1 });

    // Enhanced response with supplier details
    const enhancedOrders = await Promise.all(
      orders.map(async (order) => {
        let supplierDetails = null;

        // Fetch supplier details if available
        if (order.acceptedSupplier?.supplier_Id) {
          try {
            const supplier = await Supplier.findOne({
              supplierId: order.acceptedSupplier.supplier_Id,
            });

            if (supplier) {
              supplierDetails = {
                name: supplier.name,
                email: supplier.email,
                phone: supplier.phone,
                location: supplier.location,
                company: supplier.company,
                commodities: supplier.commodities,
              };
            }
          } catch (supplierError) {
            console.error(
              `Error fetching supplier ${order.acceptedSupplier.supplier_Id}:`,
              supplierError
            );
          }
        }

        return {
          order_id: order.order_id,
          pname: order.pname,
          Part_Name: order.Part_Name,
          category: order.category,
          working_status: order.working_status,
          isApproved: order.isApproved,
          acceptedSupplier: {
            ...order.acceptedSupplier.toObject(),
            supplierDetails: supplierDetails,
          },
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enhancedOrders.length,
      data: enhancedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders with suppliers:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching orders",
    });
  }
});

// Get supplier by ID number
router.get("/supplier/by-number/:supplierId", async (req, res) => {
  try {
    const supplierId = parseInt(req.params.supplierId);

    if (isNaN(supplierId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid supplier ID format",
      });
    }

    const supplier = await Supplier.findOne({ supplierId: supplierId }).select(
      "-password -__v"
    ); // Exclude sensitive/unnecessary fields

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        supplierId: supplier.supplierId,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        location: supplier.location,
        company: supplier.company,
        commodities: supplier.commodities,
        avatar: supplier.avatar || `/static/img/default-avatar.jpg`,
      },
    });
  } catch (error) {
    console.error("Error fetching supplier:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching supplier",
    });
  }
});

module.exports = router;
