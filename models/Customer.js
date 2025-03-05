const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const customerSchema = new mongoose.Schema({
  customer_id: { type: String, unique: true }, // Add this for unique 4-digit ID
  name: String,
  email: { type: String, unique: true }, // Ensure unique emails
  location: String,
  phone_number: Number,
  password: String,
  isLoggedIn: { type: Boolean, default: false },
});

module.exports = mongoose.model("Customer", customerSchema);
