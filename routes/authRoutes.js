const express = require("express");
const router = express.Router();
const connectDB = require("../server");
const mongoose = require("mongoose");

// Define user schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["customer", "supplier", "manufacturer"],
    required: true,
  },
});

// Function to get user model based on role
const getUserModel = (role) => {
  const db = connectDB(role);
  return db.model("User", UserSchema);
};

// Register User
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const User = getUserModel(role);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ email, password, role });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const User = getUserModel(role);
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({ message: "Login successful", role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
