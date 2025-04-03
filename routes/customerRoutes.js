const express = require("express");
const Customer = require("../models/Customer");
const LoginHistory = require("../models/loginHistory");
const multer = require("multer");
const path = require("path");

const Manufacturer = require("../models/Manufacturer"); // Adjust path if needed

const CustomerRequirement = require("../models/CustomerRequirement");

const router = express.Router();

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

// router.get("/login-history/:email", async (req, res) => {
//   try {
//     const history = await LoginHistory.find({ email: req.params.email });
//     res.status(200).json(history);
//   } catch (error) {
//     console.error("❌ Fetch Error:", error);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// if requred
// ✅ Compare hashed password
// const isMatch = await bcrypt.compare(password, customer.password);
// if (!isMatch) {
//   return res.status(401).json({ msg: "Incorrect password" });
// }

// Profile Route (Fetch customer details if logged in)
// router.get("/profile", async (req, res) => {
//   console.log("from route Session Data:", req.session); // Debugging

//   if (!req.session.email) {
//     return res.status(401).json({ msg: "Unauthorized. Please log in." });
//   }

//   try {
//     const customer = await Customer.findOne({
//       email: req.session.email,
//     }).select("-password");

//     if (!customer) {
//       return res.status(404).json({ msg: "Customer not found" });
//     }

//     res.status(200).json({ customer });
//   } catch (error) {
//     console.error("Profile Fetch Error:", error);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

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

// router.get("/profile/table", async (req, res) => {
//   console.log("🔍 Session Data in /profile:", req.session);

//   if (!req.session.email) {
//     return res.status(401).json({ msg: "Unauthorized. Please log in." });
//   }

//   try {
//     const customer = await Customer.findOne({
//       email: req.session.email,
//     }).select("-password");

//     if (!customer) {
//       return res.status(404).json({ msg: "Customer not found" });
//     }

//     if (!customer.isLoggedIn) {
//       return res
//         .status(401)
//         .json({ msg: "Session expired. Please log in again." });
//     }

//     res.status(200).json({ customer });
//   } catch (error) {
//     console.error("❌ Profile Fetch Error:", error);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// Check session data after login
// router.get("/debug/session", (req, res) => {
//   console.log("🛠 Debug Session Data:", req.session);
//   res.json(req.session);
// });

// Customer Requirement Submission Route
// router.post("/customer-requirements", async (req, res) => {
//   try {
//     const {
//       cname,
//       pname,
//       part_name,
//       category,
//       email,
//       phone_number,
//       cpno,
//       tv,
//       desc,
//       special_instructions,
//       part_revision,
//       annual_volume,
//       quote_submission,
//       start_of_production,
//       working_status,
//     } = req.body;

//     // Check if a similar requirement already exists
//     const existingRequirement = await CustomerRequirement.findOne({
//       cname,
//       pname,
//       part_name,
//     });
//     if (existingRequirement) {
//       return res.status(400).json({ msg: "Requirement already exists" });
//     }

//     // Generate a unique 6-digit ID for requirement
//     let uniqueId;
//     let idExists;
//     do {
//       uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
//       idExists = await CustomerRequirement.findOne({
//         requirement_id: uniqueId,
//       });
//     } while (idExists);

//     const newRequirement = new CustomerRequirement({
//       requirement_id: uniqueId,
//       cname,
//       pname,
//       part_name,
//       category,
//       email,
//       phone_number,
//       cpno,
//       tv,
//       desc,
//       special_instructions,
//       part_revision,
//       annual_volume,
//       quote_submission,
//       start_of_production,
//       working_status,
//     });

//     await newRequirement.save();
//     res.status(201).json({
//       msg: "Requirement submitted successfully!",
//       requirement_id: uniqueId,
//     });
//   } catch (error) {
//     console.error("Requirement Submission Error:", error);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

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

module.exports = router;
